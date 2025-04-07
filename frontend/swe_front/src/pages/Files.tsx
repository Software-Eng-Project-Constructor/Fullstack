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

const FileManagement: React.FC<FileManagementProps> = ({ projectId }) => {
  const [files, setFiles] = useState<FileItem[]>([/* Sample file data */]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    // File upload logic as before
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
    <div className="min-h-screen bg-[#0F0F0F] p-6 text-gray-200">
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
        <div className="bg-[#1C1D1D] p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-orange-500" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full bg-[#1C1D1D] text-gray-100 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="bg-[#1C1D1D] text-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 border border-orange-500/20"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {fileTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Table */}
        <div className="bg-[#1C1D1D] rounded-lg overflow-hidden border border-orange-500/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1C1D1D]">
                  <th className="px-6 py-4 text-left text-orange-400">File</th>
                  <th className="px-6 py-4 text-left text-orange-400">Type</th>
                  <th className="px-6 py-4 text-left text-orange-400">Size</th>
                  <th className="px-6 py-4 text-left text-orange-400">Last Updated</th>
                  <th className="px-6 py-4 text-left text-orange-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-700 hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{file.icon}</span>
                        <span className="text-gray-100">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{file.type}</td>
                    <td className="px-6 py-4 text-gray-300">{file.size}</td>
                    <td className="px-6 py-4 text-gray-300">{new Date(file.lastUpdated).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPreviewModal({ isOpen: true, file })}
                          className="text-gray-300 hover:text-orange-500 transition-colors"
                        >
                          <FaEye size={18} />
                        </button>
                        <button className="text-gray-300 hover:text-orange-500 transition-colors">
                          <FaDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
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
            <div className="bg-[#1C1D1D] rounded-lg p-6 max-w-4xl w-full border border-orange-500/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-500">{previewModal.file.name}</h2>
                <button
                  onClick={() => setPreviewModal({ isOpen: false, file: null })}
                  className="text-orange-500 hover:text-orange-400 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-orange-500/20">
                <div className="text-center text-gray-300">
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
              <div className="text-gray-300">
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
