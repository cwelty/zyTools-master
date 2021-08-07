/*
    Class for each entry in the heap, stores the address, a pointer to the next element in the list, its size, and whether it is freed or not.
*/
function HeapElement(nBytes) {
    this.address = 0;
    this.freed = false;
    this.next = null;
    this.size = Heap.CHUNK_SIZE * (nBytes / Heap.CHUNK_SIZE);
    if ((nBytes % Heap.CHUNK_SIZE) != 0) {
        this.size += Heap.CHUNK_SIZE;
    }
}
