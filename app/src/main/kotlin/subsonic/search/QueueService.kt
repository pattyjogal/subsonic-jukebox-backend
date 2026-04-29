package subsonic.search

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue

class QueueService {
    private val queue = ConcurrentLinkedQueue<QueueItem>()
    private val _events = MutableSharedFlow<List<QueueItem>>(replay = 1)
    val events = _events.asSharedFlow()

    private suspend fun notifyChanged() {
        _events.emit(getQueue())
    }

    suspend fun addToQueue(song: CleanSong): QueueItem {
        val item = QueueItem(
            queueId = UUID.randomUUID().toString(),
            song = song
        )
        queue.add(item)
        notifyChanged()
        return item
    }

    suspend fun next(): QueueItem? {
        val item = queue.poll()
        notifyChanged()
        return item
    }

    suspend fun remove(queueId: String): Boolean {
        val removed = queue.removeIf { it.queueId == queueId }
        if (removed) {
            notifyChanged()
        }
        return removed
    }

    suspend fun upvote(queueId: String): Boolean {
        val item = queue.find { it.queueId == queueId }
        return if (item != null) {
            queue.remove(item)
            queue.add(item.copy(upvotes = item.upvotes + 1))
            notifyChanged()
            true
        } else {
            false
        }
    }

    fun getQueue(): List<QueueItem> {
        return queue.toList()
            .sortedWith(
                compareByDescending<QueueItem> { it.upvotes }
                    .thenBy { it.addedAt }
            )
    }

    suspend fun clear() {
        queue.clear()
        notifyChanged()
    }
}
