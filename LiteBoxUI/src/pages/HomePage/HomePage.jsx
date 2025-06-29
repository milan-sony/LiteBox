import React, { useEffect, useState } from 'react'
import { UploadCloud, Download, Trash2, FolderPlus, Folder } from 'lucide-react'
import axiosInstance from '../../lib/Axios'
import Navbar from '../../components/Navbar/Navbar'
import toast from 'react-hot-toast'

function HomePage() {
    const [structure, setStructure] = useState([])
    const [currentPath, setCurrentPath] = useState([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [newFolderName, setNewFolderName] = useState('')

    const fullPath = currentPath.join('/')

    const fetchFiles = async () => {
        try {
            const res = await axiosInstance.get("/files")
            setStructure(res.data)
        } catch (err) {
            toast.error("Failed to fetch files.")
        }
    }

    const resolveCurrentDir = () => {
        let dir = structure
        for (const segment of currentPath) {
            const next = dir.find(d => d.name === segment && d.type === 'folder')
            dir = next?.children || []
        }
        return dir
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    useEffect(() => {
        fetchFiles()
    }, [])

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return toast.error("No file selected.")

        const formData = new FormData()
        formData.append('file', file)

        try {
            setUploading(true)
            setProgress(0)

            await axiosInstance.post(`/upload?folder=${encodeURIComponent(fullPath)}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => {
                    setProgress(Math.round((p.loaded * 100) / p.total))
                }
            })
            toast.success("File uploaded successfully!")
            fetchFiles()
        } catch (err) {
            toast.error("Upload failed.")
        } finally {
            setUploading(false)
        }
    }

    const createFolder = async () => {
        if (!newFolderName.trim()) {
            return toast.error("Folder name cannot be empty.")
        }

        const folderPath = [...currentPath, newFolderName].join('/')
        try {
            await axiosInstance.post('/create-folder', { folderPath })
            toast.success("Folder created!")
            setNewFolderName('')
            fetchFiles()
        } catch (err) {
            if (err.response?.status === 400) {
                toast.error("Folder already exists.")
            } else {
                toast.error("Failed to create folder.")
            }
        }
    }

    const deleteItem = async (name) => {
        const itemPath = [...currentPath, name].join('/')
        try {
            await axiosInstance.delete("/delete", { params: { path: itemPath } })
            toast.success("Deleted successfully.")
            fetchFiles()
        } catch (err) {
            toast.error("Delete failed.")
        }
    }

    const downloadFile = (name) => {
        const pathParam = [...currentPath, name].join('/')
        toast.success("Download started.")
        window.open(`${import.meta.env.VITE_APP_API_URL}/download?path=${encodeURIComponent(pathParam)}`, "_blank")
    }

    const navigateTo = (folder) => setCurrentPath([...currentPath, folder])
    const goBack = () => setCurrentPath(prev => prev.slice(0, -1))

    const items = resolveCurrentDir()

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-base-200 py-10 px-4">
                <div className="max-w-screen-lg mx-auto bg-base-100 p-6 rounded-xl shadow-lg">
                    {/* Path & Back */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                        <div className="text-sm text-secondary font-mono">
                            <strong>Path:</strong> /{fullPath || ''}
                        </div>
                        {currentPath.length > 0 && (
                            <button onClick={goBack} className="btn btn-sm btn-outline btn-secondary">⬅ Back</button>
                        )}
                    </div>

                    {/* New Folder */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="New folder name"
                            className="input input-sm input-bordered w-full sm:w-auto flex-1"
                        />
                        <button onClick={createFolder} className="btn btn-sm btn-secondary">
                            <FolderPlus size={16} className="mr-1" /> Create
                        </button>
                    </div>

                    {/* Upload Box */}
                    <div
                        className="border-2 border-dashed border-secondary p-6 rounded-lg text-center cursor-pointer bg-base-300 hover:bg-base-100 transition"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault()
                            const file = e.dataTransfer.files[0]
                            if (file) {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.files = e.dataTransfer.files
                                handleUpload({ target: input })
                            }
                        }}
                    >
                        <input type="file" className="hidden" id="fileInput" onChange={handleUpload} />
                        <label htmlFor="fileInput" className="cursor-pointer block text-sm text-secondary">
                            <UploadCloud className="mx-auto w-6 h-6 mb-2" />
                            Click or drag a file to upload
                        </label>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="mt-4">
                            <progress className="progress progress-info w-full" value={progress} max="100"></progress>
                            <p className="text-xs text-center mt-1 text-info">Uploading... {progress}%</p>
                        </div>
                    )}

                    {/* File/Folder List */}
                    <div className="mt-6 space-y-2">
                        {items.map(item => (
                            <div
                                key={item.name}
                                className="flex justify-between items-center bg-base-200 hover:bg-base-100 px-4 py-2 rounded-lg transition"
                            >
                                <div className="flex items-center gap-2 w-3/4 truncate">
                                    {item.type === 'folder' ? (
                                        <button
                                            onClick={() => navigateTo(item.name)}
                                            className="text-secondary hover:underline text-left"
                                        >
                                            <Folder className="inline-block w-5 h-5 mr-1" />
                                            {item.name}
                                            <span className="text-xs text-gray-500 ml-2">
                                                {/* Size not shown for folders unless computed */}
                                            </span>
                                        </button>
                                    ) : (
                                        <span className="text-secondary truncate">
                                            📄 {item.name}
                                            <span className="text-xs text-gray-500 ml-2">
                                                {item.size ? formatBytes(item.size) : ''}
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {item.type === 'file' && (
                                        <button onClick={() => downloadFile(item.name)} className="btn btn-xs btn-success">
                                            <Download size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteItem(item.name)} className="btn btn-xs btn-error">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage
