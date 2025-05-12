import React, { useState, ChangeEvent, JSX } from "react";
import {
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileAlt,
  FaSearch,
  FaDownload,
  FaEye,
  FaTrash,
  FaCloudUploadAlt
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  icon: JSX.Element;
  fileUrl?: string;
}

interface FileManagementProps {
  projectId: number; // The prop to receive projectId
}


function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase();
  if (!ext) return 'UNKNOWN';
  return ext;
}

function getFileIcon(name: string): JSX.Element {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <FaFileImage />;
    case 'pdf':
      return <FaFilePdf />;
    case 'doc':
    case 'docx':
      return <FaFileWord />;
    case 'ppt':
    case 'pptx':
      return <FaFilePowerpoint />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel />;
    case 'txt':
      return <FaFileAlt />;
    default:
      return <FaFileAlt />;
  }
}


const FileManagement: React.FC<FileManagementProps> = ({ projectId }) => {
  const [files, setFiles] = useState<FileItem[]>([/* Sample file data */]);
  const { theme } = useTheme(); // Use theme context

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main background and text colors
        mainBg: 'bg-gray-100',
        textColor: 'text-gray-800',
        textMuted: 'text-gray-600',
        
        // Card and panel backgrounds
        cardBg: 'bg-white',
        filtersBg: 'bg-white',
        
        // Table styles
        tableHeaderBg: 'bg-gray-50',
        tableHeaderText: 'text-gray-700',
        tableRowHover: 'hover:bg-orange-50',
        tableBorder: 'border-gray-300',
        
        // Modal styles
        modalBg: 'bg-white',
        previewBg: 'bg-gray-200',
        
        // Input styles
        inputBg: 'bg-white',
        inputText: 'text-gray-800',
        inputPlaceholder: 'placeholder-gray-500',
        inputFocus: 'focus:ring-orange-500',
        inputBorder: 'border-gray-300',
        
        // Button hover states
        buttonHover: 'hover:text-orange-500',
        buttonDelete: 'hover:text-red-500',
      };
    } else {
      return {
        // Main background and text colors
        mainBg: 'bg-[#0F0F0F]',
        textColor: 'text-gray-200',
        textMuted: 'text-gray-300',
        
        // Card and panel backgrounds
        cardBg: 'bg-[#1C1D1D]',
        filtersBg: 'bg-[#1C1D1D]',
        
        // Table styles
        tableHeaderBg: 'bg-[#1C1D1D]',
        tableHeaderText: 'text-orange-400',
        tableRowHover: 'hover:bg-orange-500/10',
        tableBorder: 'border-gray-700',
        
        // Modal styles
        modalBg: 'bg-[#1C1D1D]',
        previewBg: 'bg-gray-700',
        
        // Input styles
        inputBg: 'bg-[#1C1D1D]',
        inputText: 'text-gray-100',
        inputPlaceholder: 'placeholder-gray-500',
        inputFocus: 'focus:ring-orange-500',
        inputBorder: 'border-orange-500/20',
        
        // Button hover states
        buttonHover: 'hover:text-orange-500',
        buttonDelete: 'hover:text-red-500',
      };
    }
  };

  const styles = getThemeStyles();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files!).map((file, index) => {
      const fileType = getFileType(file.name);
      const fileIcon = getFileIcon(file.name);
      //temporary URL instead of server for files
     
      const fileUrl = URL.createObjectURL(file);

      return {
        id: files.length + index + 1, // Simple ID for demo
        name: file.name,
        type: fileType,
        size: (file.size / 1024).toFixed(2) + " KB", // Simplified size
        lastUpdated: new Date().toISOString(), // Now
        icon: fileIcon,
        fileUrl: fileUrl,
      };
    });
    setFiles([...files, ...newFiles]);
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const fileTypes: string[] = ["All", "PDF", "DOC", "PPT", "Excel", "TXT", "PNG"];
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; file: FileItem | null }>({ isOpen: false, file: null });

  return (
    <div className={`min-h-screen ${styles.mainBg} p-6 ${styles.textColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">File Management for Project {projectId}</h1>
          <div className="relative">
            <input type="file" className="hidden" id="file-upload" onChange={handleFileUpload} />
            <label htmlFor="file-upload" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
              <FaCloudUploadAlt size={20} />
              Upload File
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className={`${styles.filtersBg} p-6 rounded-lg mb-8 border ${styles.inputBorder}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-orange-500" />
              <input
                type="text"
                placeholder="Search files..."
                className={`w-full ${styles.inputBg} ${styles.inputText} pl-10 pr-4 py-2 rounded-md focus:outline-none ${styles.inputFocus}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className={`${styles.inputBg} ${styles.inputText} px-4 py-2 rounded-md focus:outline-none ${styles.inputFocus} border ${styles.inputBorder}`}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {fileTypes.map((type) => (
                <option key={type} value={type} className={theme === 'light' ? 'text-gray-800' : 'text-gray-200'}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Table */}
        <div className={`${styles.cardBg} rounded-lg overflow-hidden border ${styles.inputBorder}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={styles.tableHeaderBg}>
                  <th className={`px-6 py-4 text-left ${styles.tableHeaderText}`}>File</th>
                  <th className={`px-6 py-4 text-left ${styles.tableHeaderText}`}>Type</th>
                  <th className={`px-6 py-4 text-left ${styles.tableHeaderText}`}>Size</th>
                  <th className={`px-6 py-4 text-left ${styles.tableHeaderText}`}>Last Updated</th>
                  <th className={`px-6 py-4 text-left ${styles.tableHeaderText}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} className={`border-b ${styles.tableBorder} ${styles.tableRowHover} transition-colors cursor-pointer`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{file.icon}</span>
                        <span className={styles.textColor}>{file.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${styles.textMuted}`}>{file.type}</td>
                    <td className={`px-6 py-4 ${styles.textMuted}`}>{file.size}</td>
                    <td className={`px-6 py-4 ${styles.textMuted}`}>{new Date(file.lastUpdated).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPreviewModal({ isOpen: true, file })}
                          className={`${styles.textMuted} ${styles.buttonHover} transition-colors`}
                        >
                          <FaEye size={18} />
                        </button>
                        <button className={`${styles.textMuted} ${styles.buttonHover} transition-colors`}>
                          <FaDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className={`${styles.textMuted} ${styles.buttonDelete} transition-colors`}
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal */}
        {previewModal.isOpen && previewModal.file && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${styles.modalBg} rounded-lg p-6 max-w-4xl w-full border ${styles.inputBorder}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-500">{previewModal.file.name}</h2>
                <button
                  onClick={() => setPreviewModal({ isOpen: false, file: null })}
                  className="text-orange-500 hover:text-orange-400 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className={`${styles.previewBg} p-4 rounded-lg mb-4 border ${styles.inputBorder}`}>
                <div className="text-center">
                  {previewModal.file.type.match(/^(PNG|JPG|JPEG|GIF)$/) ? (
                    <img src={previewModal.file.fileUrl} alt={previewModal.file.name} className="max-h-96 mx-auto" />
                  ) : previewModal.file.type === "PDF" ? (
                    <iframe src={previewModal.file.fileUrl} className="w-full h-96" title={previewModal.file.name} />
                  ) : (
                    <div className="py-8">
                      <span className="text-4xl mb-2">{previewModal.file.icon}</span>
                      <p className="mt-2 text-orange-400">Preview not available for this file type</p>
                      <a href={previewModal.file.fileUrl} download={previewModal.file.name} className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">
                        Download to View
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.textColor}>
                <p>Type: <span className="text-orange-400">{previewModal.file.type}</span></p>
                <p>Size: <span className="text-orange-400">{previewModal.file.size}</span></p>
                <p>Last Updated: <span className="text-orange-400">{new Date(previewModal.file.lastUpdated).toLocaleString()}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagement;