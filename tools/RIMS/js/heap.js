/*
    Class implements a heap with an interface of malloc and free.
    |heapStart| - integer, first adress for heap.
    |maxSize| - integer, max size of the heap.
*/
function Heap(heapStart, maxSize) {
    this.heapStart = (heapStart != undefined ? heapStart : 0);
    this.maxSize = (maxSize != undefined ? maxSize : 0);
    this.currentSize = 0;
    this.start = this.last = this.firstfree = null;
}

// Constant, 64 bytes
Heap.CHUNK_SIZE = 64;

/*
    Allocates |nBytes| and returns the address to the start of the allocated block. Returns address the allocated block
    |nBytes| - integer, number of bytes to allocate
*/
Heap.prototype.malloc = function(nBytes) {
    var allocating = true;
    var element;
    if ((this.currentSize + nBytes) > this.maxSize) {
        return 0;
    }
    if (this.currentSize == 0) {
        element = new HeapElement(nBytes);
        this.start = element;
        this.last = element;
        element.address = this.heapStart;
        this.firstfree = null;
    }
    else {
        // Find chunk with best matching size.
        if (this.firstfree != null) {
            // First try to use a freed chunk.
            for (var e = this.firstfree; allocating; e = e.next) {
                // Scan free chunks.
                if (e == null) {
                    break;
                }
                if (e.freed) {
                    if (e.size >= nBytes) {
                        // Assign to freed chunk.
                        element = e;
                        element.freed = false;
                        allocating = false;
                    }
                }
            }
        }
        if (element == null) {
            // Add new chunk at end of linked list.
            if ((this.last.address + nBytes) < (this.start.address + this.maxSize)) {
                element = new HeapElement(nBytes);
                element.address = this.last.address + this.last.size;
                this.last.next = element;
                this.last = element;
            }
            else {
            // Not enough memory.
                return 0;
            }
        }
    }
    this.currentSize += element.size;
    return element.address;
};

/*
    Frees the block at |address|
    |address| - integer, address of the block in memory.
*/
Heap.prototype.free = function(address) {
    var searching = true;
    var element = this.start;
    do {
        if (element && (element.address == address)) {
            element.freed = true;
            this.currentSize -= element.size;
            searching = false;
            if ((this.firstfree == null) || (element.address < this.firstfree.address)) {
                this.firstfree = element;
            }
        }
        else if (element != null) {
            element = element.next;
        }
        else {
            return; // couldn't find allocated data chunk (free behavior undefined)
        }
    } while (searching);
};

// Free all memory
Heap.prototype.reset = function() {
    this.start = this.last = this.firstfree = null;
    this.currentSize = 0;
};
