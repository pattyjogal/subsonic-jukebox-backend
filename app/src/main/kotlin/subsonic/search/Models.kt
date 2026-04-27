package subsonic.search

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SubsonicResponse(
    @SerialName("subsonic-response")
    val response: ResponseContent
)

@Serializable
data class ResponseContent(
    val status: String,
    val version: String,
    val searchResult3: SearchResult3? = null,
    val error: SubsonicError? = null
)

@Serializable
data class SearchResult3(
    val song: List<Song> = emptyList()
)

@Serializable
data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Int? = null,
    val coverArt: String? = null
)

@Serializable
data class SubsonicError(
    val code: Int,
    val message: String
)

@Serializable
data class CleanSong(
    val id: String,
    val title: String,
    val artist: String,
    val album: String
)

@Serializable
data class QueueItem(
    val queueId: String,
    val song: CleanSong,
    val addedAt: Long = System.currentTimeMillis()
)
