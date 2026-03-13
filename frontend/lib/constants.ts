// frontend/lib/constants.ts

// ============================================================================
// DADOS DA LOJA - PIZZARIA VENETO
// ============================================================================
export const STORE_ID = 1; // ✅ CORRIGIDO: ID da loja no banco de dados
export const STORE_NAME = 'Pizzaria Veneto';
export const STORE_WHATSAPP_NUMBER = '5521988559703'; // Sem formatação
export const STORE_DELIVERY_FEE = 5.0;
export const STORE_ADDRESS = 'Rodovia Amaral Peixoto, Km 22,5 (ao lado do Mercado Rede Economia), Maricá - RJ'; // ✅ CORRIGIDO: Endereço real
export const STORE_PHONE = '(21) 3333-3333'; // ✅ CORRIGIDO: Telefone real

// ============================================================================
// CASHBACK
// ============================================================================
export const CASHBACK_PERCENTAGE = 0.05; // 5%
export const CASHBACK_DESCRIPTION = '💰 Ganhe 5% de cashback em cada compra!';

// ============================================================================
// CORES DA MARCA
// ============================================================================
export const BRAND_COLORS = {
  primary: '#DC2626', // Vermelho
  secondary: '#16A34A', // Verde
  dark: '#000000', // Preto
  light: '#FFFFFF', // Branco
  accent: '#F97316', // Laranja (opcional)
};

// ============================================================================
// CONFIGURAÇÕES DE PAGAMENTO
// ============================================================================
export const PAYMENT_METHODS = [
  { id: 'na_entrega', label: 'Dinheiro na Entrega' },
  // { id: 'pix', label: 'Pix' }, // Adicionar quando implementar
  // { id: 'credit_card', label: 'Cartão de Crédito' }, // Adicionar quando implementar
];

// ============================================================================
// HORÁRIOS DE FUNCIONAMENTO
// ============================================================================
export const STORE_HOURS = {
  open: '17:00',
  close: '23:00',
};

// ============================================================================
// FUNÇÃO: Gerar Mensagem do WhatsApp
// ============================================================================
export function generateWhatsAppOrderMessage({
  orderCode,
  customerName,
  customerAddress,
  customerPhone,
  items,
  subtotal,
  deliveryFee,
  total,
  paymentMethod,
  notes,
}: {
  orderCode: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; total: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}): string {
  const itemsList = items
    .map((item) => `• ${item.quantity}x ${item.name} - R$ ${item.total.toFixed(2).replace('.', ',')}`)
    .join('\n');

  const message = `
🍕 *NOVO PEDIDO - ${STORE_NAME}* 🍕

📋 *Código do Pedido:* ${orderCode}

👤 *Cliente:* ${customerName}
📱 *Telefone:* ${customerPhone}
📍 *Endereço:* ${customerAddress}

🛒 *Itens:*
${itemsList}

💰 *Resumo:*
Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}
Taxa de Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}
*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*

💳 *Forma de Pagamento:* ${paymentMethod}
${notes ? `📝 *Observações:* ${notes}` : ''}

✅ Confirme o recebimento deste pedido!
  `.trim();

  return encodeURIComponent(message);
}

// ============================================================================
// FUNÇÃO: Validar Telefone
// ============================================================================
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\d{2})\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

// ============================================================================
// FUNÇÃO: Formatar Telefone
// ============================================================================
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// ============================================================================
// FUNÇÃO: Formatar Moeda
// ============================================================================
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}