package subsonic.search

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("subsonic.search.App")

fun main() {
    val baseUrl = System.getenv("SUBSONIC_URL") ?: "http://localhost:4040"
    val username = System.getenv("SUBSONIC_USER") ?: "admin"
    val password = System.getenv("SUBSONIC_PASS") ?: "admin"

    logger.info("Starting Subsonic Search Service...")
    logger.info("Base URL: {}", baseUrl)
    logger.info("Username: {}", username)

    val subsonicService = SubsonicService(baseUrl, username, password)

    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            json()
        }

        routing {
            get("/search") {
                val query = call.request.queryParameters["q"]
                if (query == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing search query parameter 'q'"))
                    return@get
                }

                logger.info("Received search request for query: {}", query)

                try {
                    val results = subsonicService.searchSongs(query)
                    call.respond(results)
                } catch (e: Exception) {
                    logger.error("Error during search for query: {}", query, e)
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Unknown error")))
                }
            }
        }
    }.start(wait = true)
}
