# Chapter 4: Why Write-Ahead Logs Stall at Midnight

At 03:14 UTC on October 12, every client shard attached to `pg-east-04` froze for 412 milliseconds.

CPU usage sat at 11 percent. Network buffers were empty. Yet forty-two thousand queued writes waited behind one `fsync` call on `/dev/nvme0n1`.

The culprit was not disk bandwidth. When background checkpoint compaction collided with synchronous journal flushes on the same NVMe submission queue, tail latency jumped fourteen-fold while average IOPS barely moved. Isolating the write-ahead log onto a dedicated namespace cut p99 stall duration from 412 ms to 1.8 ms without changing a line of SQL.
