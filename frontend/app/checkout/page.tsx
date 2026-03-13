// frontend/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { createOrder } from '@/lib/api';
import {
  STORE_ID,
  STORE_WHATSAPP_NUMBER,
  STORE_DELIVERY_FEE,
  generateWhatsAppOrderMessage,
  CASHBACK_PERCENTAGE,
  BRAND_COLORS,
  formatCurrency,
} from '@/lib/constants';
import Link from 'next/link';

export default function Checkout() {
  const items = useCartStore((state) => state.getItems());
  const subtotal = useCartStore((state) => state.getSubtotal());
  const total = useCartStore((state) => state.getTotal(STORE_DELIVERY_FEE));
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cashbackAmount = subtotal * CASHBACK_PERCENTAGE;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.phone || !formData.address) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      const order = await createOrder({
        store_id: STORE_ID,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        payment_method: 'na_entrega',
        delivery_fee: STORE_DELIVERY_FEE,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        notes: formData.notes,
      });

      const whatsappMessage = generateWhatsAppOrderMessage({
        orderCode: order.order_code,
        customerName: formData.name,
        customerAddress: formData.address,
        customerPhone: formData.phone,
        items: items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          total: item.total,
        })),
        subtotal,
        deliveryFee: STORE_DELIVERY_FEE,
        total,
        paymentMethod: 'Dinheiro na Entrega',
        notes: formData.notes,
      });

      const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');

      clearCart();
      setSuccess(true);
      setFormData({ name: '', phone: '', address: '', notes: '' });

      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Seu Carrinho está Vazio</h1>
        <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar.</p>
        <Link
          href="/"
          className="inline-block text-white font-bold py-2 px-6 rounded-lg transition-colors"
          style={{ backgroundColor: BRAND_COLORS.primary }}
        >
          Voltar ao Cardápio
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 inline-block">
          <h2 className="text-2xl font-bold mb-2">✅ Pedido Criado com Sucesso!</h2>
          <p className="mb-4">Você será redirecionado para o cardápio em alguns segundos...</p>
          <Link
            href="/"
            className="inline-block text-white font-bold py-2 px-6 rounded-lg transition-colors"
            style={{ backgroundColor: BRAND_COLORS.secondary }}
          >
            Voltar ao Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Seus Dados</h2>

            {/* Campo Nome */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Digite seu nome completo"
              />
            </div>

            {/* Campo Telefone */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="(21) 98765-4321"
              />
            </div>

            {/* Campo Endereço */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Endereço de Entrega *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Rua, número, bairro"
              />
            </div>

            {/* Campo Observações */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Observações (Opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Ex: Sem cebola, extra queijo, etc."
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                ❌ {error}
              </div>
            )}

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.secondary }}
            >
              {loading ? '⏳ Processando...' : '📱 Enviar Pedido via WhatsApp'}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-20">
          <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>

          {/* Lista de Itens */}
          <div className="mb-4 border-b pb-4 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between mb-2 text-sm">
                <span>
                  {item.quantity}x {item.product_name}
                </span>
                <span className="font-semibold">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Cálculos */}
          <div className="space-y-2 mb-4 border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-semibold">
              <span>💰 Cashback (5%):</span>
              <span>+ {formatCurrency(cashbackAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Entrega:</span>
              <span className="font-semibold">{formatCurrency(STORE_DELIVERY_FEE)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span style={{ color: BRAND_COLORS.primary }}>
              {formatCurrency(total)}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            💳 Pagamento na entrega
          </p>
        </div>
      </div>
    </div>
  );
}