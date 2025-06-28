import React, { useEffect, useState } from 'react'
import { UploadCloud, Download, Trash2, FolderPlus, Folder } from 'lucide-react'
import axiosInstance from '../../lib/Axios'

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
            console.error('Fetch error:', err)
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

    useEffect(() => {
        fetchFiles()
    }, [])

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', fullPath)

        try {
            setUploading(true)
            setProgress(0)

            await axiosInstance.post(`/upload?folder=${encodeURIComponent(fullPath)}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => {
                    setProgress(Math.round((p.loaded * 100) / p.total))
                }
            })
            fetchFiles()
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
        }
    }

    const createFolder = async () => {
        if (!newFolderName.trim()) return
        const folderPath = [...currentPath, newFolderName].join('/')
        try {
            await axiosInstance.post('/create-folder', { folderPath })
            fetchFiles()
            setNewFolderName('')
        } catch (err) {
            console.error('Create folder error:', err)
        }
    }

    const deleteItem = async (name) => {
        const itemPath = [...currentPath, name].join('/')
        try {
            await axiosInstance.delete("/delete", { params: { path: itemPath } })
            fetchFiles()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    const downloadFile = (name) => {
        const pathParam = [...currentPath, name].join('/')
        window.open(`${import.meta.env.VITE_APP_API_URL}/download?path=${encodeURIComponent(pathParam)}`, "_blank")
    }

    const navigateTo = (folder) => setCurrentPath([...currentPath, folder])
    const goBack = () => setCurrentPath(prev => prev.slice(0, -1))

    const items = resolveCurrentDir()

    return (
        <>
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
                    <h1 className="text-2xl font-bold text-center mb-4">📦 SimpleBox</h1>

                    <div className="flex flex-wrap items-center justify-between mb-4">
                        <div>
                            <span className="text-sm text-gray-600">Path:</span>
                            <span className="ml-2 font-mono text-blue-500">/{fullPath || ''}</span>
                        </div>
                        {currentPath.length > 0 && (
                            <button
                                onClick={goBack}
                                className="text-sm text-blue-600 hover:underline"
                            >⬅ Back</button>
                        )}
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="New folder name"
                            className="border px-3 py-1 rounded-md text-sm w-full"
                        />
                        <button onClick={createFolder} className="bg-blue-500 text-white px-4 py-1 rounded-md">
                            <FolderPlus size={18} className="inline mr-1" /> Create
                        </button>
                    </div>

                    <div
                        className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50"
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
                        <label htmlFor="fileInput" className="cursor-pointer text-blue-600 font-medium">
                            <UploadCloud className="mx-auto w-6 h-6 mb-2" /> Click or drag a file to upload
                        </label>
                    </div>

                    {uploading && (
                        <div className="w-full mt-3 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <p className="text-xs text-center mt-1">Uploading... {progress}%</p>
                        </div>
                    )}

                    <ul className="mt-6 space-y-2">
                        {items.map(item => (
                            <li
                                key={item.name}
                                className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
                            >
                                <span className="truncate w-5/6">
                                    {item.type === 'folder' ? (
                                        <button onClick={() => navigateTo(item.name)} className="text-blue-600 font-medium">
                                            <Folder className="inline-block mr-1 w-5 h-5" /> {item.name}
                                        </button>
                                    ) : (
                                        <span>{item.name}</span>
                                    )}
                                </span>
                                <div className="flex gap-3">
                                    {item.type === 'file' && (
                                        <button onClick={() => downloadFile(item.name)} className="text-green-600">
                                            <Download size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteItem(item.name)} className="text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default HomePage