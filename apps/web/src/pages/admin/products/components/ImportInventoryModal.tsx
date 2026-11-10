import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  importInventorySpreadsheetAdmin,
  type ImportInventoryResult,
} from '../../../../api/admin/admin.products.api'

interface ImportInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onNavigateToInactive: () => void
}

export const ImportInventoryModal: React.FC<ImportInventoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigateToInactive,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportInventoryResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase().split('.').pop()
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      toast.error('Please upload a .csv, .xlsx, or .xls file.')
      return
    }
    setFile(selectedFile)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to import.')
      return
    }

    try {
      setIsUploading(true)
      const res = await importInventorySpreadsheetAdmin(file)
      setResult(res)
      toast.success(
        `Import completed! ${res.createdProducts} products created (inactive).`,
      )
      onSuccess()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to import inventory'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadSample = () => {
    const sampleHeaders =
      'Name,MRP,HSN,Parent Group,Tax Rate,SKU,Selling Price,Stock,Category,Status,EAN,Weight (g)\r\n'
    const sampleRow1 =
      'Benzac SA Foaming Cleanser MRP 599,599,3304,Cetaphil,0.18,CET-BENZ-599,549,25,Cleanser,INACTIVE,8901234567890,150\r\n'
    const sampleRow2 =
      'Cetaphil Baby Shampoo MRP 728.50@5%,728.5,3304,Cetaphil,0.18,CET-SHMP-728,,15,Baby Care,INACTIVE,,200\r\n'
    const blob = new Blob(['\uFEFF' + sampleHeaders + sampleRow1 + sampleRow2], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample-inventory-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const resetModal = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-background-main border border-primary/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between bg-background-light/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-icons-outlined text-[22px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-text-main-light">
                Import Inventory Spreadsheet
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Upload your CSV or Excel file. New products will be added as inactive for your verification.
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="text-text-muted hover:text-text-main-light p-1.5 rounded-lg hover:bg-background-light transition-colors"
          >
            <span className="material-icons-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!result ? (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : file
                      ? 'border-green-500/40 bg-green-500/5'
                      : 'border-primary/20 hover:border-primary/50 bg-background-light/20 hover:bg-background-light/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-icons-outlined text-3xl">
                    {file ? 'description' : 'cloud_upload'}
                  </span>
                </div>
                {file ? (
                  <div>
                    <p className="font-bold text-text-main-light text-base">{file.name}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {(file.size / 1024).toFixed(1)} KB — Ready to process
                    </p>
                    <span className="inline-block mt-3 text-xs text-primary font-bold hover:underline">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-text-main-light text-base">
                      Drag & drop your inventory sheet here
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Supports CSV (.csv) and Excel (.xlsx, .xls) files
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all inline-flex items-center gap-1.5"
                    >
                      <span className="material-icons-outlined text-[16px]">folder_open</span>
                      Browse Computer
                    </button>
                  </div>
                )}
              </div>

              {/* Supported Columns & Guide */}
              <div className="bg-background-light/40 border border-primary/10 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-main-light uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="material-icons-outlined text-primary text-[16px]">info</span>
                    Accepted Spreadsheet Columns
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <span className="material-icons-outlined text-[14px]">download</span>
                    Download Sample Template
                  </button>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Required columns: <strong className="text-text-main-light">Name</strong>,{' '}
                  <strong className="text-text-main-light">MRP</strong>. Additional detected fields:{' '}
                  <span className="text-text-main-light/80">HSN, Parent Group (Brand), Tax Rate, SKU, Selling Price, Stock, Category, EAN, Weight</span>.
                </p>
                <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400/90 flex items-start gap-2">
                  <span className="material-icons-outlined text-[16px] shrink-0 mt-0.5">verified_user</span>
                  <span>
                    <strong>Verification Guarantee:</strong> All newly added products are imported as <em>Inactive</em>.
                    You can inspect each product in the admin portal before activating it for customers.
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
                <span className="material-icons-outlined text-2xl">check_circle</span>
                <div>
                  <h4 className="font-bold text-sm">Spreadsheet Imported Successfully!</h4>
                  <p className="text-xs opacity-90">
                    Processed {result.totalProcessed} rows. New products are inactive and ready for review.
                  </p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-background-light border border-primary/10 rounded-xl text-center">
                  <span className="text-2xl font-display font-bold text-yellow-400">
                    {result.createdProducts}
                  </span>
                  <p className="text-[11px] text-text-muted uppercase font-bold mt-1">
                    New Products (Inactive)
                  </p>
                </div>
                <div className="p-3.5 bg-background-light border border-primary/10 rounded-xl text-center">
                  <span className="text-2xl font-display font-bold text-primary">
                    {result.updatedProducts}
                  </span>
                  <p className="text-[11px] text-text-muted uppercase font-bold mt-1">
                    Updated Products
                  </p>
                </div>
                <div className="p-3.5 bg-background-light border border-primary/10 rounded-xl text-center">
                  <span className="text-2xl font-display font-bold text-text-main-light">
                    {result.createdVariants}
                  </span>
                  <p className="text-[11px] text-text-muted uppercase font-bold mt-1">
                    Variants Added
                  </p>
                </div>
                <div className="p-3.5 bg-background-light border border-primary/10 rounded-xl text-center">
                  <span
                    className={`text-2xl font-display font-bold ${
                      result.errors.length > 0 ? 'text-red-400' : 'text-text-muted'
                    }`}
                  >
                    {result.errors.length}
                  </span>
                  <p className="text-[11px] text-text-muted uppercase font-bold mt-1">
                    Warnings / Skipped
                  </p>
                </div>
              </div>

              {/* Error list if any */}
              {result.errors.length > 0 && (
                <div className="bg-background-light border border-red-500/20 rounded-xl p-4">
                  <h5 className="font-bold text-xs text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-icons-outlined text-[16px]">warning</span>
                    Skipped Rows or Warnings ({result.errors.length})
                  </h5>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs text-text-muted pr-2 font-mono">
                    {result.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="py-1 px-2 rounded bg-background-main/50 flex justify-between gap-4"
                      >
                        <span>
                          Row {err.row}: {err.name || 'Unnamed item'}
                        </span>
                        <span className="text-red-400/80">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-primary/10 bg-background-light/40 flex items-center justify-between">
          {!result ? (
            <>
              <button
                type="button"
                onClick={resetModal}
                className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main-light hover:bg-background-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  !file || isUploading
                    ? 'opacity-50 cursor-not-allowed bg-primary/20 text-text-muted'
                    : 'bg-primary text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] cursor-pointer'
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="material-icons-outlined text-[18px] animate-spin">refresh</span>
                    Processing Spreadsheet...
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-[18px]">file_upload</span>
                    Import Spreadsheet
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main-light hover:bg-background-light transition-colors"
              >
                Import Another File
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main-light hover:bg-background-light transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetModal()
                    onNavigateToInactive()
                  }}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-icons-outlined text-[18px]">verified</span>
                  Review Inactive Products Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
