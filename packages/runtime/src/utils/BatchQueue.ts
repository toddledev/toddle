/**
 * A helper class to batch multiple callbacks and process them in a single tick.
 * This is more efficient than processing each callback in a separate tick, as creating a new tick is expensive.
 * It also allows batching DOM updates, which can help to reduce layout thrashing.
 */
export class BatchQueue {
  private batchQueue = new Set<() => void>()
  private isProcessing = false

  private processBatch() {
    if (this.isProcessing) return
    this.isProcessing = true

    setTimeout(() => {
      this.batchQueue.forEach((callback) => callback())
      this.batchQueue.clear()
      this.isProcessing = false
    })
  }

  public add(callback: () => void) {
    this.batchQueue.add(callback)
    this.processBatch()
  }
}
