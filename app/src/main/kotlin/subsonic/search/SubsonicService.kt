package subsonic.search

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import java.security.MessageDigest
import kotlin.random.Random

class SubsonicService(
    private val baseUrl: String,
    private val username: String,
    private val password: String
) {
    private val logger = LoggerFactory.getLogger(SubsonicService::class.java)

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
                explicitNulls = false
            })
        }
    }

    private fun generateSalt(): String {
        val charPool = "abcdefghijklmnopqrstuvwxyz0123456789"
        return (1..10)
            .map { Random.nextInt(0, charPool.length) }
            .map(charPool::get)
            .joinToString("")
    }

    private fun md5(input: String): String {
        val md = MessageDigest.getInstance("MD5")
        return md.digest(input.toByteArray()).joinToString("") { "%02x".format(it) }
    }

    suspend fun searchSongs(query: String): List<CleanSong> {
        val salt = generateSalt()
        val token = md5(password + salt)
        val url = baseUrl.removeSuffix("/") + "/rest/search3"

        logger.debug("Calling Subsonic API at: {}", url)

        val response: SubsonicResponse = try {
            client.get(url) {
                parameter("u", username)
                parameter("t", token)
                parameter("s", salt)
                parameter("v", "1.16.1")
                parameter("c", "KtorSearchService")
                parameter("f", "json")
                parameter("query", query)
            }.body()
        } catch (e: Exception) {
            logger.error("Failed to connect to Subsonic server at {}", url, e)
            throw e
        }

        if (response.response.status == "failed") {
            val error = response.response.error
            logger.error("Subsonic API returned failure: code={}, message={}", error?.code, error?.message)
            throw Exception("Subsonic API error: ${error?.code} - ${error?.message}")
        }

        return response.response.searchResult3?.song?.map {
            val songSalt = generateSalt()
            val songToken = md5(password + songSalt)
            val streamUrl = baseUrl.removeSuffix("/") + "/rest/stream?" +
                    "u=$username&t=$songToken&s=$songSalt&v=1.16.1&c=KtorSearchService&id=${it.id}"
            
            val coverArtUrl = it.coverArt?.let { artId ->
                baseUrl.removeSuffix("/") + "/rest/getCoverArt?" +
                        "u=$username&t=$songToken&s=$songSalt&v=1.16.1&c=KtorSearchService&id=$artId"
            }

            CleanSong(
                id = it.id,
                title = it.title,
                artist = it.artist,
                album = it.album,
                streamUrl = streamUrl,
                coverArtUrl = coverArtUrl
            )
        } ?: emptyList()
    }
}
