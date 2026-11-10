import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { exportInventorySpreadsheetAdmin } from '../../../../api/admin/admin.products.api'

interface ExportInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ExportInventoryModal: React.FC<ExportInventoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx')
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const { blob, filename } = await exportInventorySpreadsheetAdmin({
        format,
        status,
      })

      // Trigger browser download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Inventory exported as ${filename}`)
      onClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to export inventory'
      toast.error(msg)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-background-main border border-primary/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between bg-background-light/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-icons-outlined text-[22px]">download</span>
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-text-main-light">
                Export Inventory Sheet
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Download current catalog data into a spreadsheet for editing or offline analysis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main-light p-1.5 rounded-lg hover:bg-background-light transition-colors"
          >
            <span className="material-icons-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  format === 'xlsx'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-primary/10 hover:border-primary/30 bg-background-light/30 text-text-muted'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-text-main-light">
                  <span className="material-icons-outlined text-green-500 text-[20px]">table_view</span>
                  Excel Workbook (.xlsx)
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Native Microsoft Excel format with formatted worksheets
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-primary/10 hover:border-primary/30 bg-background-light/30 text-text-muted'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-text-main-light">
                  <span className="material-icons-outlined text-blue-400 text-[20px]">description</span>
                  CSV (.csv)
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Universal text format with UTF-8 BOM encoding
                </p>
              </button>
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Filter by Product Status
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'ALL',
                  label: 'All Products',
                  desc: 'Export complete catalog (active and inactive)',
                },
                {
                  value: 'ACTIVE',
                  label: 'Active Only',
                  desc: 'Only products currently live on the store',
                },
                {
                  value: 'INACTIVE',
                  label: 'Inactive Only (Pending Verification)',
                  desc: 'Only products awaiting verification or draft items',
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    status === opt.value
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-primary/10 hover:border-primary/20 bg-background-light/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value as any)}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main-light block">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-text-muted block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-primary/10 bg-background-light/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text-main-light hover:bg-background-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="material-icons-outlined text-[18px] animate-spin">refresh</span>
                Exporting...
              </>
            ) : (
              <>
                <span className="material-icons-outlined text-[18px]">file_download</span>
                Download Spreadsheet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
