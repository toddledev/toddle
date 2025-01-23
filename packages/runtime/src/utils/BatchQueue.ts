/**
 * A helper class to batch multiple callbacks and process them in a single update step just before the next frame render, but after the current stack.
 * This is more efficient than processing each callback in a separate requestAnimationFrame due to the overhead.
 */
export class BatchQueue {
  private batchQueue = new Set<() => void>()
  private isProcessing = false

  private processBatch() {
    if (this.isProcessing) return
    this.isProcessing = true

    requestAnimationFrame(() => {
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
