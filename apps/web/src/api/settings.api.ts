import axiosInstance from './axiosInstance'

export interface WhatsAppContact {
  whatsappNumber: string
  defaultMessage: string
  supportEmail: string
  supportPhone: string
}

export const getWhatsAppContact = async (): Promise<WhatsAppContact> => {
  const { data: resp } = await axiosInstance.get('/settings/whatsapp')
  return (
    resp?.data || {
      whatsappNumber: '',
      defaultMessage: '',
      supportEmail: '',
      supportPhone: '',
    }
  ) as WhatsAppContact
}

export const getPublicSettings = async (
  group?: string,
): Promise<Record<string, string>> => {
  const { data: resp } = await axiosInstance.get('/settings', {
    params: group ? { group } : undefined,
  })
  return (resp?.data || {}) as Record<string, string>
}
