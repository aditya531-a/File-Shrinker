
// Priority Queue / Min Heap Implementation
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(node) {
    this.heap.push(node);
    this.bubbleUp();
  }

  dequeue() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return min;
  }

  size() {
    return this.heap.length;
  }

  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].freq <= this.heap[index].freq) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  bubbleDown() {
    let index = 0;
    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].freq < this.heap[smallest].freq) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].freq < this.heap[smallest].freq) {
        smallest = rightChild;
      }
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

export class HuffmanCoder {
  constructor() {
    this.root = null;
    this.codes = new Map();
    this.reverseCodes = new Map();
  }

  buildFrequencyMap(text) {
    const map = new Map();
    for (const char of text) {
      map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
  }

  buildTree(freqMap) {
    const pq = new PriorityQueue();
    
    for (const [char, freq] of freqMap.entries()) {
      pq.enqueue(new HuffmanNode(char, freq));
    }

    if (pq.size() === 0) return null;
    if (pq.size() === 1) {
       // Edge case for single character file
       const node = pq.dequeue();
       return new HuffmanNode(null, node.freq, node, null);
    }

    while (pq.size() > 1) {
      const left = pq.dequeue();
      const right = pq.dequeue();
      
      const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
      pq.enqueue(parent);
    }

    this.root = pq.dequeue();
  }

  generateCodes(node = this.root, code = "") {
    if (!node) return;

    if (!node.left && !node.right && node.char !== null) {
      this.codes.set(node.char, code);
      this.reverseCodes.set(code, node.char);
      return;
    }

    this.generateCodes(node.left, code + "0");
    this.generateCodes(node.right, code + "1");
  }

  compress(text) {
    if (!text) return { encodedData: "", treeData: null };

    const freqMap = this.buildFrequencyMap(text);
    this.buildTree(freqMap);
    
    // Edge case: single character type repeated
    if (this.codes.size === 0 && this.root) {
       if (!this.root.left && !this.root.right) {
         this.codes.set(this.root.char, "0");
         this.reverseCodes.set("0", this.root.char);
       } else {
         this.generateCodes();
       }
    } else {
      this.generateCodes();
    }

    let encodedData = "";
    for (const char of text) {
      encodedData += this.codes.get(char);
    }

    // Prepare tree data for storage/transmission
    // We need to serialize the frequency map or the tree itself to reconstruct it.
    // Storing frequency map is standard and usually smaller.
    const freqObj = Object.fromEntries(freqMap);
    
    return {
      encodedData,
      freqMap: freqObj
    };
  }

  decompress(encodedData, freqMapObj) {
    if (!encodedData || !freqMapObj) return "";

    // Reconstruct tree
    const freqMap = new Map(Object.entries(freqMapObj));
    this.buildTree(freqMap);
    this.codes.clear();
    this.reverseCodes.clear();
    
    // Edge case handling similar to compress
    if (!this.root.left && !this.root.right) {
        this.codes.set(this.root.char, "0");
    } else {
        this.generateCodes();
    }

    let decodedText = "";
    let currentNode = this.root;

    for (const bit of encodedData) {
      if (bit === "0") {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }

      if (!currentNode.left && !currentNode.right) {
        decodedText += currentNode.char;
        currentNode = this.root;
      }
    }

    return decodedText;
  }
  
  // Helper to pack bits into bytes for real binary compression
  packBits(binaryString) {
      const padding = 8 - (binaryString.length % 8);
      const paddedBinary = binaryString + "0".repeat(padding % 8);
      const bytes = [];
      
      // Store padding info in first byte
      bytes.push(padding % 8);
      
      for (let i = 0; i < paddedBinary.length; i += 8) {
          const byteStr = paddedBinary.substr(i, 8);
          bytes.push(parseInt(byteStr, 2));
      }
      
      return Buffer.from(bytes);
  }
  
  unpackBits(buffer) {
      const padding = buffer[0];
      let binaryString = "";
      
      for (let i = 1; i < buffer.length; i++) {
          const byteStr = buffer[i].toString(2).padStart(8, "0");
          binaryString += byteStr;
      }
      
      if (padding > 0) {
          binaryString = binaryString.slice(0, -padding);
      }
      
      return binaryString;
  }
}
