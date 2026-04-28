package subsonic.search

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import io.ktor.sse.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
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
    val queueService = QueueService()

    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                explicitNulls = false
            })
        }
        install(SSE)

        routing {
            // Serve the Guest Web App from resources
            singlePageApplication {
                useResources = true
                applicationRoute = "guest"
                filesPath = "static"
                defaultPage = "index.html"
            }

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

            get("/queue") {
                call.respond(queueService.getQueue())
            }

            post("/queue/add") {
                try {
                    val song = call.receive<CleanSong>()
                    val item = queueService.addToQueue(song)
                    logger.info("Added song to queue: {} - {}", song.artist, song.title)
                    call.respond(HttpStatusCode.Created, item)
                } catch (e: Exception) {
                    logger.error("Failed to add song to queue", e)
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid song data"))
                }
            }

            post("/queue/next") {
                val item = queueService.next()
                if (item != null) {
                    logger.info("Playing next song: {} - {}", item.song.artist, item.song.title)
                    call.respond(item)
                } else {
                    call.respond(HttpStatusCode.NoContent)
                }
            }

            post("/queue/remove/{id}") {
                val id = call.parameters["id"]
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing queue item ID"))
                    return@post
                }

                if (queueService.remove(id)) {
                    logger.info("Removed item from queue: {}", id)
                    call.respond(HttpStatusCode.OK, mapOf("status" to "removed"))
                } else {
                    call.respond(HttpStatusCode.NotFound, mapOf("error" to "Item not found"))
                }
            }

            post("/queue/clear") {
                queueService.clear()
                logger.info("Queue cleared")
                call.respond(HttpStatusCode.OK, mapOf("status" to "cleared"))
            }

            sse("/queue/events") {
                logger.info("Client connected to queue events")
                // Send initial state
                send(ServerSentEvent(data = Json.encodeToString(queueService.getQueue()), event = "queue-update"))
                
                queueService.events.collect { updatedQueue ->
                    send(ServerSentEvent(data = Json.encodeToString(updatedQueue), event = "queue-update"))
                }
            }
        }
    }.start(wait = true)
}
