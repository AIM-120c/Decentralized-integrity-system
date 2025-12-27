// Enhanced SecureHash Application
// Initialize variables
let provider, signer, contract;
let isConnected = false;
let selectedFiles = [];
let userHistory = [];
let publicRegistry = [];

// Enhanced Contract details (you'll need to deploy this new contract)
const contractAddress = "0x0b0D526C2e82E7E43a9F46583067bf87B0A1eE20"; // Update with new contract address
const enhancedAbi = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" },
      { "internalType": "string", "name": "fileName", "type": "string" },
      { "internalType": "string", "name": "category", "type": "string" },
      { "internalType": "string", "name": "projectName", "type": "string" },
      { "internalType": "uint256", "name": "fileSize", "type": "uint256" },
      { "internalType": "bool", "name": "isPublic", "type": "bool" },
      { "internalType": "string", "name": "description", "type": "string" }
    ],
    "name": "storeFileHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32[]", "name": "fileHashes", "type": "bytes32[]" },
      { "internalType": "string[]", "name": "fileNames", "type": "string[]" },
      { "internalType": "string[]", "name": "categories", "type": "string[]" },
      { "internalType": "string[]", "name": "projectNames", "type": "string[]" },
      { "internalType": "uint256[]", "name": "fileSizes", "type": "uint256[]" },
      { "internalType": "bool[]", "name": "isPublicArray", "type": "bool[]" },
      { "internalType": "string[]", "name": "descriptions", "type": "string[]" }
    ],
    "name": "storeBatchFileHashes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" }
    ],
    "name": "verifyFileHash",
    "outputs": [
      { "internalType": "bool", "name": "found", "type": "bool" },
      {
        "components": [
          { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" },
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "string", "name": "projectName", "type": "string" },
          { "internalType": "uint256", "name": "fileSize", "type": "uint256" },
          { "internalType": "address", "name": "uploader", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isPublic", "type": "bool" },
          { "internalType": "string", "name": "description", "type": "string" }
        ],
        "internalType": "struct EnhancedFileRegistry.FileRecord",
        "name": "record",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserVerifications",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" },
          { "internalType": "address", "name": "verifier", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "wasFound", "type": "bool" }
        ],
        "internalType": "struct EnhancedFileRegistry.VerificationRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicFiles",
    "outputs": [
      { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" }
    ],
    "name": "getFileDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" },
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "string", "name": "projectName", "type": "string" },
          { "internalType": "uint256", "name": "fileSize", "type": "uint256" },
          { "internalType": "address", "name": "uploader", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isPublic", "type": "bool" },
          { "internalType": "string", "name": "description", "type": "string" }
        ],
        "internalType": "struct EnhancedFileRegistry.FileRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "category", "type": "string" }
    ],
    "name": "getFilesByCategory",
    "outputs": [
      { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// DOM elements
const connectBtn = document.getElementById('connectBtn');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectedFilesDiv = document.getElementById('selectedFiles');
const uploadBtn = document.getElementById('uploadBtn');
const verifyBtn = document.getElementById('verifyBtn');
const batchBtn = document.getElementById('batchBtn');
const status = document.getElementById('status');
const result = document.getElementById('result');

// Metadata form elements
const categorySelect = document.getElementById('category');
const projectInput = document.getElementById('project');
const descriptionInput = document.getElementById('description');
const isPublicCheckbox = document.getElementById('isPublic');

// Tab elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

// Registry elements
const registrySearch = document.getElementById('registrySearch');
const categoryFilter = document.getElementById('categoryFilter');
const refreshRegistryBtn = document.getElementById('refreshRegistry');
const registryTableBody = document.getElementById('registryTableBody');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  loadStoredData();
});

function initializeEventListeners() {
  // Wallet and main actions
  connectBtn.addEventListener('click', connectWallet);
  uploadBtn.addEventListener('click', uploadSingleFile);
  verifyBtn.addEventListener('click', verifySingleFile);
  batchBtn.addEventListener('click', batchUploadFiles);

  // File handling
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileSelect);

  // Tab navigation
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Registry controls
  refreshRegistryBtn.addEventListener('click', loadPublicRegistry);
  registrySearch.addEventListener('input', filterRegistry);
  categoryFilter.addEventListener('change', filterRegistry);
}

// File handling functions
function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function addFiles(files) {
  files.forEach(file => {
    if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
      selectedFiles.push(file);
    }
  });
  updateSelectedFilesDisplay();
  updateButtonStates();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateSelectedFilesDisplay();
  updateButtonStates();
}

function updateSelectedFilesDisplay() {
  if (selectedFiles.length === 0) {
    selectedFilesDiv.style.display = 'none';
    dropZone.classList.remove('has-files');
    return;
  }

  selectedFilesDiv.style.display = 'block';
  dropZone.classList.add('has-files');
  
  selectedFilesDiv.innerHTML = selectedFiles.map((file, index) => `
    <div class="file-item">
      <div class="file-item-info">
        <i class="fas fa-file"></i>
        ${file.name} (${formatFileSize(file.size)})
      </div>
      <button class="file-item-remove" onclick="removeFile(${index})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function updateButtonStates() {
  const hasFiles = selectedFiles.length > 0;
  const isSingleFile = selectedFiles.length === 1;
  
  if (isConnected && hasFiles) {
    uploadBtn.disabled = !isSingleFile;
    verifyBtn.disabled = !isSingleFile;
    batchBtn.disabled = selectedFiles.length < 2;
  } else {
    uploadBtn.disabled = true;
    verifyBtn.disabled = true;
    batchBtn.disabled = true;
  }
}

// Wallet connection
async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask to use this application!");
    return false;
  }

  const loading = document.getElementById('connectLoading');
  const btnText = connectBtn.querySelector('span');

  loading.style.display = 'block';
  btnText.textContent = 'Connecting...';

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, enhancedAbi, signer);

    isConnected = true;
    connectBtn.classList.add('connected');
    connectBtn.innerHTML = `<i class="fas fa-check-circle"></i><span>Connected: ${accounts[0].substring(0, 6)}...</span>`;

    status.textContent = `Successfully connected to ${accounts[0]}`;
    status.className = 'status-success';

    updateButtonStates();
    loadUserHistory();
    loadPublicRegistry();

    return true;
  } catch (err) {
    console.error("Connection error:", err);
    status.textContent = "Failed to connect wallet. Please try again.";
    status.className = 'status-error';
    return false;
  } finally {
    loading.style.display = 'none';
  }
}

// File operations
async function uploadSingleFile() {
  if (!isConnected && !(await connectWallet())) return;
  if (selectedFiles.length !== 1) {
    alert("Please select exactly one file for single upload");
    return;
  }

  const loading = document.getElementById('uploadLoading');
  const btnText = uploadBtn.querySelector('span');

  loading.style.display = 'block';
  btnText.textContent = 'Storing...';
  uploadBtn.disabled = true;

  try {
    const file = selectedFiles[0];
    const hash = await hashFile(file);
    const metadata = getMetadata(file);

    status.textContent = "Submitting transaction to blockchain...";
    status.className = '';

    const tx = await contract.storeFileHash(
      hash,
      metadata.fileName,
      metadata.category,
      metadata.projectName,
      metadata.fileSize,
      metadata.isPublic,
      metadata.description
    );

    status.textContent = "Transaction submitted. Waiting for confirmation...";
    await tx.wait();

    status.textContent = "✅ File hash successfully stored on blockchain!";
    status.className = 'status-success';
    result.innerHTML = `
      <strong>✅ Upload Successful!</strong><br>
      📄 File: ${file.name}<br>
      📂 Category: ${metadata.category || 'None'}<br>
      🏷️ Project: ${metadata.projectName || 'None'}<br>
      🔗 Transaction: ${tx.hash}<br>
      ${metadata.isPublic ? '🌐 Public: Yes' : '🔒 Public: No'}
    `;
    result.className = 'status-success';

    // Add to local history
    addToHistory({
      hash,
      fileName: file.name,
      category: metadata.category,
      projectName: metadata.projectName,
      timestamp: Date.now(),
      type: 'upload',
      success: true
    });

  } catch (err) {
    console.error("Upload error:", err);
    status.textContent = "❌ Failed to store hash on blockchain";
    status.className = 'status-error';
    result.textContent = err.message || "Upload failed. Please try again.";
    result.className = 'status-error';
  } finally {
    loading.style.display = 'none';
    btnText.textContent = 'Store Hash';
    updateButtonStates();
  }
}

async function verifySingleFile() {
  if (selectedFiles.length !== 1) {
    alert("Please select exactly one file for verification");
    return;
  }

  const loading = document.getElementById('verifyLoading');
  const btnText = verifyBtn.querySelector('span');

  loading.style.display = 'block';
  btnText.textContent = 'Verifying...';
  verifyBtn.disabled = true;

  try {
    const file = selectedFiles[0];
    const hash = await hashFile(file);

    status.textContent = "Searching blockchain for file hash...";
    status.className = '';

    const [found, record] = await contract.verifyFileHash(hash);

    if (found) {
      const date = new Date(record.timestamp * 1000).toLocaleString();
      status.textContent = "✅ File hash found on blockchain!";
      status.className = 'status-success';
      result.innerHTML = `
        <strong>✅ Verification Successful!</strong><br>
        📄 File: ${record.fileName}<br>
        📂 Category: ${record.category || 'None'}<br>
        🏷️ Project: ${record.projectName || 'None'}<br>
        👤 Uploaded by: ${record.uploader}<br>
        📅 Timestamp: ${date}<br>
        📝 Description: ${record.description || 'None'}<br>
        ${record.isPublic ? '🌐 Public: Yes' : '🔒 Public: No'}<br>
        🔒 Hash verified and authentic
      `;
      result.className = 'status-success';
    } else {
      status.textContent = "Hash verification completed";
      status.className = '';
      result.innerHTML = `
        <strong>❌ Hash Not Found</strong><br>
        📄 File: ${file.name}<br>
        ⚠️ This file hash does not exist on the blockchain<br>
        💡 Upload it first to create a permanent record
      `;
      result.className = 'status-error';
    }

    // Add to verification history
    addToHistory({
      hash,
      fileName: file.name,
      timestamp: Date.now(),
      type: 'verify',
      success: found
    });

  } catch (err) {
    console.error("Verification error:", err);
    status.textContent = "❌ Verification failed";
    status.className = 'status-error';
    result.textContent = err.message || "Verification failed. Please try again.";
    result.className = 'status-error';
  } finally {
    loading.style.display = 'none';
    btnText.textContent = 'Verify Hash';
    updateButtonStates();
  }
}

async function batchUploadFiles() {
  if (!isConnected && !(await connectWallet())) return;
  if (selectedFiles.length < 2) {
    alert("Please select at least 2 files for batch upload");
    return;
  }

  const loading = document.getElementById('batchLoading');
  const btnText = batchBtn.querySelector('span');

  loading.style.display = 'block';
  btnText.textContent = 'Processing...';
  batchBtn.disabled = true;

  try {
    status.textContent = "Processing files and generating hashes...";
    status.className = '';

    // Generate hashes and prepare data
    const fileHashes = [];
    const fileNames = [];
    const categories = [];
    const projectNames = [];
    const fileSizes = [];
    const isPublicArray = [];
    const descriptions = [];

    for (const file of selectedFiles) {
      const hash = await hashFile(file);
      const metadata = getMetadata(file);

      fileHashes.push(hash);
      fileNames.push(metadata.fileName);
      categories.push(metadata.category);
      projectNames.push(metadata.projectName);
      fileSizes.push(metadata.fileSize);
      isPublicArray.push(metadata.isPublic);
      descriptions.push(metadata.description);
    }

    status.textContent = "Submitting batch transaction to blockchain...";

    const tx = await contract.storeBatchFileHashes(
      fileHashes,
      fileNames,
      categories,
      projectNames,
      fileSizes,
      isPublicArray,
      descriptions
    );

    status.textContent = "Batch transaction submitted. Waiting for confirmation...";
    await tx.wait();

    status.textContent = `✅ Successfully stored ${selectedFiles.length} file hashes on blockchain!`;
    status.className = 'status-success';
    result.innerHTML = `
      <strong>✅ Batch Upload Successful!</strong><br>
      📊 Files processed: ${selectedFiles.length}<br>
      🔗 Transaction: ${tx.hash}<br>
      ⏰ All files now have immutable blockchain records
    `;
    result.className = 'status-success';

    // Add all files to history
    selectedFiles.forEach((file, index) => {
      addToHistory({
        hash: fileHashes[index],
        fileName: file.name,
        category: categories[index],
        projectName: projectNames[index],
        timestamp: Date.now(),
        type: 'batch_upload',
        success: true
      });
    });

  } catch (err) {
    console.error("Batch upload error:", err);
    status.textContent = "❌ Batch upload failed";
    status.className = 'status-error';
    result.textContent = err.message || "Batch upload failed. Please try again.";
    result.className = 'status-error';
  } finally {
    loading.style.display = 'none';
    btnText.textContent = 'Batch Upload';
    updateButtonStates();
  }
}

// Utility functions
function getMetadata(file) {
  return {
    fileName: file.name,
    category: categorySelect.value || '',
    projectName: projectInput.value || '',
    fileSize: file.size,
    isPublic: isPublicCheckbox.checked,
    description: descriptionInput.value || ''
  };
}

async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  return ethers.utils.keccak256(new Uint8Array(buffer));
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Tab navigation
function switchTab(tabName) {
  navTabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');

  if (tabName === 'registry') {
    loadPublicRegistry();
  } else if (tabName === 'history') {
    loadUserHistory();
  }
}

// History management
function addToHistory(record) {
  userHistory.unshift(record);
  if (userHistory.length > 100) { // Keep last 100 records
    userHistory = userHistory.slice(0, 100);
  }
  saveHistoryToStorage();
  if (document.getElementById('history').classList.contains('active')) {
    displayUserHistory();
  }
}

function loadStoredData() {
  const stored = localStorage.getItem('securehash_history');
  if (stored) {
    try {
      userHistory = JSON.parse(stored);
    } catch (e) {
      userHistory = [];
    }
  }
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem('securehash_history', JSON.stringify(userHistory));
  } catch (e) {
    console.warn('Failed to save history to localStorage');
  }
}

// Registry and history display functions
async function loadPublicRegistry() {
  if (!contract) return;

  try {
    status.textContent = "Loading public registry...";
    const publicHashes = await contract.getPublicFiles();
    publicRegistry = [];

    for (const hash of publicHashes) {
      try {
        const details = await contract.getFileDetails(hash);
        publicRegistry.push({
          hash,
          fileName: details.fileName,
          category: details.category,
          projectName: details.projectName,
          fileSize: details.fileSize.toString(),
          uploader: details.uploader,
          timestamp: details.timestamp.toString(),
          description: details.description
        });
      } catch (e) {
        console.warn('Failed to load details for hash:', hash);
      }
    }

    displayRegistry();
    status.textContent = `Loaded ${publicRegistry.length} public files`;
    status.className = 'status-success';

  } catch (err) {
    console.error("Failed to load public registry:", err);
    status.textContent = "Failed to load public registry";
    status.className = 'status-error';
  }
}

function displayRegistry() {
  if (!registryTableBody) return;

  if (publicRegistry.length === 0) {
    registryTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem;">
          No public files found
        </td>
      </tr>
    `;
    return;
  }

  registryTableBody.innerHTML = publicRegistry.map(file => `
    <tr>
      <td>${file.fileName}</td>
      <td>${file.category || 'N/A'}</td>
      <td>${file.projectName || 'N/A'}</td>
      <td>${formatFileSize(parseInt(file.fileSize))}</td>
      <td class="hash-cell">${file.uploader.substring(0, 8)}...</td>
      <td>${new Date(parseInt(file.timestamp) * 1000).toLocaleDateString()}</td>
      <td class="hash-cell">${file.hash.substring(0, 10)}...</td>
    </tr>
  `).join('');
}

async function loadUserHistory() {
  if (!contract || !isConnected) return;

  try {
    const address = await signer.getAddress();
    const verifications = await contract.getUserVerifications(address);
    
    // Combine local history with blockchain verification history
    const blockchainHistory = verifications.map(v => ({
      hash: v.fileHash,
      timestamp: parseInt(v.timestamp.toString()) * 1000,
      type: 'verify_blockchain',
      success: v.wasFound
    }));

    const combinedHistory = [...userHistory, ...blockchainHistory]
      .sort((a, b) => b.timestamp - a.timestamp);

    displayUserHistory(combinedHistory);

  } catch (err) {
    console.error("Failed to load user history:", err);
    displayUserHistory(userHistory);
  }
}

function displayUserHistory(history = userHistory) {
  const historyTableBody = document.getElementById('historyTableBody');
  if (!historyTableBody) return;

  if (history.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem;">
          No history found
        </td>
      </tr>
    `;
    return;
  }

  historyTableBody.innerHTML = history.map(record => `
    <tr>
      <td>${record.fileName || 'Unknown'}</td>
      <td>${record.type.replace('_', ' ').toUpperCase()}</td>
      <td class="${record.success ? 'status-success' : 'status-error'}">
        ${record.success ? '✅ Success' : '❌ Failed'}
      </td>
      <td>${new Date(record.timestamp).toLocaleString()}</td>
      <td class="hash-cell">${record.hash ? record.hash.substring(0, 10) + '...' : 'N/A'}</td>
    </tr>
  `).join('');
}

function filterRegistry() {
  const searchTerm = registrySearch.value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;

  let filtered = publicRegistry;

  if (searchTerm) {
    filtered = filtered.filter(file =>
      file.fileName.toLowerCase().includes(searchTerm) ||
      file.category.toLowerCase().includes(searchTerm) ||
      file.projectName.toLowerCase().includes(searchTerm)
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter(file => file.category === categoryFilter);
  }

  // Temporarily replace publicRegistry for display
  const originalRegistry = publicRegistry;
  publicRegistry = filtered;
  displayRegistry();
  publicRegistry = originalRegistry;
}

// Handle wallet events
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      isConnected = false;
      connectBtn.classList.remove('connected');
      connectBtn.innerHTML = '<i class="fas fa-wallet"></i><span>Connect Wallet</span>';
      status.textContent = 'Please connect your wallet to continue';
      status.className = '';
      updateButtonStates();
    } else {
      location.reload(); // Refresh to reconnect with new account
    }
  });
}

// Make removeFile globally accessible
window.removeFile = removeFile;