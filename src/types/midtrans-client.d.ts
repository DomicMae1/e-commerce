// src/types/midtrans.d.ts

// 1. Mendefinisikan tipe data untuk objek 'result' dari callback Midtrans
interface MidtransPayResult {
  status_code: string;
  transaction_id: string;
  transaction_status: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  fraud_status: string;
  // Tambahkan properti lain yang mungkin ada jika diperlukan
}

// 2. Mendefinisikan struktur dari objek 'snap'
interface MidtransSnap {
  pay: (
    token: string,
    options?: {
      onSuccess?: (result: MidtransPayResult) => void;
      onPending?: (result: MidtransPayResult) => void;
      onError?: (result: MidtransPayResult) => void;
      onClose?: () => void;
    }
  ) => void;
}

// 3. Memberitahu TypeScript bahwa 'window' memiliki properti 'snap'
declare global {
  interface Window {
    snap?: MidtransSnap; // Gunakan '?' karena snap dimuat secara eksternal
  }
}
