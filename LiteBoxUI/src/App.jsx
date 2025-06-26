import React, { useEffect, useState } from 'react'
import { UploadCloud, Download, Trash2 } from 'lucide-react'
import axiosInstance from './lib/Axios'

function App() {

    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const fetchFiles = async () => {
        try {
            const res = await axiosInstance.get('/files')
            setFiles(Array.isArray(res.data.files) ? res.data.files : [])
        } catch (err) {
            console.error('Error fetching files:', err)
            setFiles([])
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [])

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            setUploading(true)
            setProgress(0)

            await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded * 100) / p.total)
                    setProgress(percent)
                }
            })

            setUploading(false)
            fetchFiles()
        } catch (err) {
            console.error('Upload failed:', err)
            setUploading(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            const input = document.createElement('input')
            input.type = 'file'
            input.files = e.dataTransfer.files
            handleUpload({ target: input })
        }
    }

    const deleteFile = async (filename) => {
        try {
            await axiosInstance.delete(`/delete/${filename}`)
            fetchFiles()
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
                <h1 className="text-2xl font-bold text-center mb-4">📦 SimpleBox</h1>

                <div
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        type="file"
                        className="hidden"
                        id="fileInput"
                        onChange={handleUpload}
                    />
                    <label htmlFor="fileInput" className="cursor-pointer text-blue-500 font-medium">
                        <UploadCloud className="mx-auto mb-2 w-8 h-8" />
                        Click or drag a file to upload
                    </label>
                </div>

                {uploading && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                        <p className="text-xs text-center mt-1">Uploading... {progress}%</p>
                    </div>
                )}

                <div className="mt-6">
                    <h2 className="font-semibold mb-2">📁 Files</h2>
                    {files.length === 0 ? (
                        <p className="text-sm text-gray-500">No files uploaded yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {files.map((file) => (
                                <li key={file} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                    <span className="truncate w-5/6" title={file}>{file}</span>
                                    <div className="flex gap-3">
                                        <a
                                            href={`/download/${file}`}
                                            className="text-blue-600 hover:underline"
                                            download
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                        <button onClick={() => deleteFile(file)} className="text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App