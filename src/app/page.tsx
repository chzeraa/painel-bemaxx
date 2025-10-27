'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { User, Shield, Eye, EyeOff, Copy, Plus, Search, Filter, BarChart3, Users, CreditCard, Settings, LogOut, Bell, Calendar, TrendingUp, DollarSign, Activity, Clock, CheckCircle, XCircle, Edit, Trash2, RefreshCw, X, AlertCircle, Mail, Check, Instagram, MessageCircle } from 'lucide-react'

// Tipos de dados
interface UserType {
  id: string
  nome: string
  email: string
  senha?: string
  tipo: 'admin' | 'user'
  ativo: boolean
  bloqueado?: boolean
  dataCreacao: string
  totalVendas: number
  valorArrecadado: number
  valorPagoPlataforma?: number
  proximoVencimento?: string
  statusPagamento?: 'em_dia' | 'pendente' | 'atrasado'
  valorAcesso?: number
}

interface Matricula {
  numero: string
  status: 'disponivel' | 'usado'
  dataGeracao: string
  dataCopia?: string
  usuarioId?: string
  clienteNome?: string
  clienteEmail?: string
  valor?: number
  dataVenda?: string
  diasAtivos: number
  metodoPagamento?: 'cartao' | 'pix' | 'dinheiro' | 'pendente'
  excluida?: boolean
  dataExclusao?: string
}

interface Pagamento {
  id: string
  usuarioId: string
  valor: number
  dataPagamento: string
  metodo: string
  status: 'pago' | 'pendente'
  tipo: 'plataforma' | 'mensalidade' | 'venda'
  descricao?: string
}

// Função para formatar data em português brasileiro (DD/MM/AAAA)
const formatarDataBR = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Função para obter data atual em formato brasileiro
const obterDataAtualBR = () => {
  const hoje = new Date()
  const dia = hoje.getDate().toString().padStart(2, '0')
  const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')
  const ano = hoje.getFullYear()
  return `${dia}/${mes}/${ano}`
}

// Dados mock simulando banco de dados (com usuário admin solicitado)
const mockUsers: UserType[] = [
  {
    id: '1',
    nome: 'Admin Sistema',
    email: 'admin@bemaxx.com',
    senha: '4321',
    tipo: 'admin',
    ativo: true,
    bloqueado: false,
    dataCreacao: '01/01/2024',
    totalVendas: 0,
    valorArrecadado: 0
  }
]

const mockMatriculas: Matricula[] = [
  { numero: 'aec001234', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001235', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001236', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001237', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001238', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001239', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001240', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001241', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001242', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 },
  { numero: 'aec001243', status: 'disponivel', dataGeracao: '01/01/2024', diasAtivos: 30 }
]

const mockPagamentos: Pagamento[] = []

// Função para verificar email
const verificarEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para copiar texto
const copiarTexto = async (texto: string) => {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch (err) {
    return false
  }
}

// Componente de Toast
const Toast = memo(({ toast }: { toast: { message: string; type: 'success' | 'error' } | null }) => {
  if (!toast) return null
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
      toast.type === 'success' ? 'bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white' : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
    }`}>
      {toast.message}
    </div>
  )
})

// Modal de Novo Usuário
const NewUserModal = memo(({ 
  show, 
  onClose, 
  onSubmit, 
  form, 
  setForm 
}: {
  show: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  form: {
    nome: string
    email: string
    senha: string
    emailVerificado: boolean
    tipo: 'admin' | 'user'
    valorAcesso: string
  }
  setForm: (form: any) => void
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }, [setForm])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Novo Usuário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="Nome completo do usuário"
              value={form.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
                placeholder="usuario@email.com"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {form.email && verificarEmail(form.email) ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : form.email ? (
                  <X className="w-4 h-4 text-red-400" />
                ) : (
                  <Mail className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha *</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailVerificado"
              className="w-4 h-4 text-[#00AEEF] bg-gray-800 border-gray-600 rounded focus:ring-[#00AEEF]"
              checked={form.emailVerificado}
              onChange={(e) => handleInputChange('emailVerificado', e.target.checked)}
            />
            <label htmlFor="emailVerificado" className="ml-2 text-sm font-medium text-gray-300">
              Email verificado
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Usuário *</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as 'admin' | 'user')}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor de Acesso (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="0,00 (opcional)"
              value={form.valorAcesso}
              onChange={(e) => handleInputChange('valorAcesso', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Valor que o usuário deve pagar para acessar a plataforma
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 font-medium transform hover:scale-105 text-sm"
            >
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

// Modal de Confirmação de Exclusão
const DeleteConfirmModal = memo(({ 
  show, 
  onClose, 
  onConfirm, 
  item 
}: {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  item: { type: 'user' | 'matricula' | 'pagamento'; id: string; name: string } | null
}) => {
  if (!show || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <div className="bg-red-900/50 p-3 rounded-full mr-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Confirmar Exclusão</h2>
            <p className="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-300">
            Tem certeza que deseja excluir <strong className="text-white">{item.name}</strong>?
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium transform hover:scale-105 text-sm"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
})

// Modal de Edição de Usuário
const EditUserModal = memo(({ 
  show, 
  onClose, 
  onSubmit, 
  form, 
  setForm 
}: {
  show: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  form: {
    nome: string
    email: string
    senha: string
    tipo: 'admin' | 'user'
    ativo: boolean
    bloqueado: boolean
    statusPagamento: 'em_dia' | 'pendente' | 'atrasado'
  }
  setForm: (form: any) => void
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }, [setForm])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Editar Usuário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              placeholder="Deixe em branco para manter a atual"
              value={form.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as 'admin' | 'user')}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status Pagamento</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.statusPagamento}
              onChange={(e) => handleInputChange('statusPagamento', e.target.value as any)}
            >
              <option value="em_dia">Em dia</option>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                className="w-4 h-4 text-[#00AEEF] bg-gray-800 border-gray-600 rounded focus:ring-[#00AEEF]"
                checked={form.ativo}
                onChange={(e) => handleInputChange('ativo', e.target.checked)}
              />
              <label htmlFor="ativo" className="ml-2 text-sm font-medium text-gray-300">
                Usuário ativo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="bloqueado"
                className="w-4 h-4 text-red-500 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                checked={form.bloqueado}
                onChange={(e) => handleInputChange('bloqueado', e.target.checked)}
              />
              <label htmlFor="bloqueado" className="ml-2 text-sm font-medium text-gray-300">
                Usuário bloqueado
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 font-medium transform hover:scale-105 text-sm"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

// Modal de Matrícula com animação de carregamento
const MatriculaModal = memo(({ 
  show, 
  onClose, 
  onSubmit, 
  form, 
  setForm,
  matriculaGerada 
}: {
  show: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  form: {
    clienteNome: string
    clienteEmail: string
    valor: string
    metodoPagamento: 'cartao' | 'pix' | 'dinheiro' | 'pendente'
  }
  setForm: (form: any) => void
  matriculaGerada: string | null
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }, [setForm])

  const handleCopiar = async () => {
    if (matriculaGerada) {
      const sucesso = await copiarTexto(matriculaGerada)
      // Aqui você poderia adicionar um toast de sucesso
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Registrar Venda</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-[#00AEEF]/20 to-[#0088CC]/20 rounded-lg border border-[#00AEEF]/30">
          <p className="text-sm text-gray-300 mb-2">Matrícula gerada:</p>
          <div className="flex items-center space-x-2">
            <p className="font-mono text-lg font-semibold text-[#00AEEF] flex-1">{matriculaGerada}</p>
            <button
              onClick={handleCopiar}
              className="p-2 bg-[#00AEEF]/20 hover:bg-[#00AEEF]/30 rounded-lg transition-all duration-200 transform hover:scale-105"
              title="Copiar número da matrícula"
            >
              <Copy className="w-4 h-4 text-[#00AEEF]" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Cliente *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="Digite o nome completo"
              value={form.clienteNome}
              onChange={(e) => handleInputChange('clienteNome', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email do Cliente *
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="cliente@email.com"
              value={form.clienteEmail}
              onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor da Venda (R$) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Método de Pagamento
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white text-sm"
              value={form.metodoPagamento}
              onChange={(e) => handleInputChange('metodoPagamento', e.target.value as any)}
            >
              <option value="pendente">Definir depois</option>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Você pode alterar depois na seção "Minhas Matrículas"
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 font-medium transform hover:scale-105 text-sm"
            >
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

// Modal de Adicionar Matrícula (Admin)
const AddMatriculaModal = memo(({ 
  show, 
  onClose, 
  onSubmit, 
  form, 
  setForm 
}: {
  show: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  form: { numero: string }
  setForm: (form: any) => void
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }, [setForm])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Adicionar Nova Matrícula</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-[#00AEEF]/20 to-[#0088CC]/20 rounded-lg border border-[#00AEEF]/30">
          <p className="text-sm text-gray-300 mb-2">
            <strong>Prefixo automático:</strong> Todas as matrículas iniciam com "aec"
          </p>
          <p className="text-xs text-gray-400">
            Exemplo: Se você digitar "123456", será salvo como "aec123456"
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número da Matrícula *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm font-mono">aec</span>
              </div>
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
                placeholder="123456"
                value={form.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Digite apenas os números após "aec"
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 font-medium transform hover:scale-105 text-sm"
            >
              Adicionar Matrícula
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

// Modal de Loading para Geração de Matrícula
const LoadingModal = memo(({ show }: { show: boolean }) => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Iniciando geração...')

  useEffect(() => {
    if (!show) {
      setProgress(0)
      setLoadingText('Iniciando geração...')
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2
        
        if (newProgress <= 20) {
          setLoadingText('Verificando matrículas disponíveis...')
        } else if (newProgress <= 40) {
          setLoadingText('Validando sistema...')
        } else if (newProgress <= 60) {
          setLoadingText('Processando dados...')
        } else if (newProgress <= 80) {
          setLoadingText('Gerando número único...')
        } else if (newProgress <= 95) {
          setLoadingText('Finalizando processo...')
        } else {
          setLoadingText('Matrícula gerada com sucesso!')
        }
        
        return Math.min(newProgress, 100)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700 text-center">
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#00AEEF] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-white mb-2">Gerando Matrícula</h2>
          <p className="text-gray-400 text-sm">{loadingText}</p>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#00AEEF] to-[#0088CC] rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
})

// Componente de Login
const LoginForm = memo(({ 
  loginForm, 
  setLoginForm, 
  handleLogin, 
  showPassword, 
  setShowPassword,
  loginError
}: {
  loginForm: { email: string; password: string }
  setLoginForm: (form: { email: string; password: string }) => void
  handleLogin: (e: React.FormEvent) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  loginError: string | null
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
    {/* Fundo tecnológico com efeitos de mistério */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00AEEF]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      {/* Grid pattern tecnológico */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      {/* Linhas de circuito */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-px bg-gradient-to-r from-transparent via-[#00AEEF]/30 to-transparent"></div>
        <div className="absolute top-40 right-20 w-48 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute bottom-32 left-1/3 w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
      </div>
    </div>

    <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-700/50 relative">
        {/* Efeito de brilho na borda */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00AEEF]/20 via-transparent to-purple-500/20 rounded-3xl blur-xl -z-10"></div>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Halo de destaque para a logo */}
              <div className="absolute inset-0 bg-white rounded-2xl blur-2xl opacity-30 scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00AEEF] to-white rounded-2xl blur-lg opacity-20 scale-105"></div>
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9ab7f438-6ca1-43b7-b29c-94b2aac7242e.png" 
                alt="BEMAXX Logo" 
                className="relative h-32 w-auto drop-shadow-2xl bg-white rounded-2xl p-3 border-2 border-[#00AEEF]/30"
              />
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00AEEF] via-white to-[#00AEEF] bg-clip-text text-transparent mb-4 tracking-wide">
              BEMAXX
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] mx-auto rounded-full mb-6 shadow-lg shadow-[#00AEEF]/50"></div>
            <h2 className="text-2xl font-semibold text-white mb-3 tracking-wide">Sistema de Criação de Contas</h2>
          </div>
          <p className="text-gray-300 text-lg mb-4 font-medium">Entrar no Painel</p>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-yellow-300 text-sm font-semibold">ACESSO PREMIUM</p>
            </div>
            <p className="text-yellow-200 text-sm leading-relaxed">
              💡 Para conseguir acesso ao painel, clique no botão <strong>Suporte</strong> e adquira através do pagamento
            </p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-4 bg-gray-800/90 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm backdrop-blur-sm shadow-inner"
              placeholder="seu@email.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-4 bg-gray-800/90 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-300 pr-12 text-white placeholder-gray-400 text-sm backdrop-blur-sm shadow-inner"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="bg-red-900/50 border border-red-600 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-300 text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {loginError}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white py-4 rounded-xl font-semibold hover:from-[#0088CC] hover:to-[#006699] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative">Entrar no Painel</span>
          </button>
        </form>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="https://www.instagram.com/bemaxx.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </a>
          
          <a
            href="https://wa.me/5538999671578?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20painel%20bemaxx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Suporte</span>
          </a>
        </div>
      </div>
    </div>
  </div>
))

export default function PainelVendas() {
  const [currentView, setCurrentView] = useState<'login' | 'user-panel' | 'admin-panel'>('login')
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  
  // Estados do formulário
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  
  // Estados dos dados
  const [users, setUsers] = useState<UserType[]>(mockUsers)
  const [matriculas, setMatriculas] = useState<Matricula[]>(mockMatriculas)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(mockPagamentos)
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'matriculas' | 'users' | 'payments'>('overview')

  // Estados do modal de matrícula
  const [showMatriculaModal, setShowMatriculaModal] = useState(false)
  const [matriculaForm, setMatriculaForm] = useState({
    clienteNome: '',
    clienteEmail: '',
    valor: '',
    metodoPagamento: 'pendente' as 'cartao' | 'pix' | 'dinheiro' | 'pendente'
  })
  const [matriculaGerada, setMatriculaGerada] = useState<string | null>(null)

  // Estados do modal de adicionar matrícula (admin)
  const [showAddMatriculaModal, setShowAddMatriculaModal] = useState(false)
  const [addMatriculaForm, setAddMatriculaForm] = useState({
    numero: ''
  })

  // Estados dos modais de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'user' | 'matricula' | 'pagamento'; id: string; name: string } | null>(null)

  // Estados dos modais de edição
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [editUserForm, setEditUserForm] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'user' as 'admin' | 'user',
    ativo: true,
    bloqueado: false,
    statusPagamento: 'pendente' as 'em_dia' | 'pendente' | 'atrasado'
  })

  // Estados do modal de novo usuário
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    nome: '',
    email: '',
    senha: '',
    emailVerificado: false,
    tipo: 'user' as 'admin' | 'user',
    valorAcesso: ''
  })

  // Estado do modal de loading
  const [showLoadingModal, setShowLoadingModal] = useState(false)

  // Função para mostrar toast
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Função de login
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    
    const user = users.find(u => u.email === loginForm.email && u.senha === loginForm.password)
    
    if (!user) {
      setLoginError('Email ou senha incorretos')
      return
    }
    
    if (user.bloqueado) {
      setLoginError('Usuário bloqueado. Entre em contato com o suporte para resolver.')
      return
    }
    
    if (!user.ativo) {
      setLoginError('Usuário inativo. Entre em contato com o suporte.')
      return
    }

    setCurrentUser(user)
    setCurrentView(user.tipo === 'admin' ? 'admin-panel' : 'user-panel')
    showToast('Login realizado com sucesso!', 'success')
  }, [loginForm.email, loginForm.password, users, showToast])

  // Função para gerar matrícula aleatória
  const gerarMatricula = useCallback(() => {
    const disponiveis = matriculas.filter(m => m.status === 'disponivel')
    if (disponiveis.length === 0) {
      showToast('Nenhuma matrícula disponível', 'error')
      return null
    }

    // Selecionar uma matrícula aleatória das disponíveis
    const indiceAleatorio = Math.floor(Math.random() * disponiveis.length)
    const matriculaSelecionada = disponiveis[indiceAleatorio]
    
    setShowLoadingModal(true)
    
    setTimeout(() => {
      setMatriculaGerada(matriculaSelecionada.numero)
      setShowLoadingModal(false)
      setShowMatriculaModal(true)
    }, 5000) // 5 segundos de loading
    
    return matriculaSelecionada.numero
  }, [matriculas, showToast])

  // Função para finalizar venda da matrícula
  const finalizarVenda = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!matriculaGerada || !currentUser) return

    const valor = parseFloat(matriculaForm.valor)
    if (isNaN(valor) || valor <= 0) {
      showToast('Valor inválido', 'error')
      return
    }

    // Atualizar a matrícula
    const matriculaIndex = matriculas.findIndex(m => m.numero === matriculaGerada)
    if (matriculaIndex !== -1) {
      const updatedMatriculas = [...matriculas]
      updatedMatriculas[matriculaIndex] = {
        ...updatedMatriculas[matriculaIndex],
        status: 'usado',
        dataCopia: obterDataAtualBR(),
        dataVenda: obterDataAtualBR(),
        usuarioId: currentUser.id,
        clienteNome: matriculaForm.clienteNome,
        clienteEmail: matriculaForm.clienteEmail,
        valor: valor,
        metodoPagamento: matriculaForm.metodoPagamento
      }
      setMatriculas(updatedMatriculas)

      // Atualizar estatísticas do usuário
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            totalVendas: user.totalVendas + 1,
            valorArrecadado: user.valorArrecadado + valor
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setCurrentUser({...currentUser, totalVendas: currentUser.totalVendas + 1, valorArrecadado: currentUser.valorArrecadado + valor})

      showToast('Venda registrada com sucesso!', 'success')
      
      // Limpar formulário e fechar modal
      setMatriculaForm({ clienteNome: '', clienteEmail: '', valor: '', metodoPagamento: 'pendente' })
      setShowMatriculaModal(false)
      setMatriculaGerada(null)
    }
  }, [matriculaGerada, currentUser, matriculaForm, matriculas, users, showToast])

  // Função para fechar modal
  const fecharModal = useCallback(() => {
    setShowMatriculaModal(false)
    setMatriculaGerada(null)
    setMatriculaForm({ clienteNome: '', clienteEmail: '', valor: '', metodoPagamento: 'pendente' })
  }, [])

  // Função para adicionar nova matrícula (admin)
  const adicionarMatricula = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!addMatriculaForm.numero.trim()) {
      showToast('Número da matrícula é obrigatório', 'error')
      return
    }

    // Adicionar prefixo "aec" se não existir
    let numeroCompleto = addMatriculaForm.numero.trim()
    if (!numeroCompleto.toLowerCase().startsWith('aec')) {
      numeroCompleto = 'aec' + numeroCompleto
    }

    // Verificar se já existe
    if (matriculas.find(m => m.numero === numeroCompleto)) {
      showToast('Esta matrícula já existe', 'error')
      return
    }

    const novaMatricula: Matricula = {
      numero: numeroCompleto,
      status: 'disponivel',
      dataGeracao: obterDataAtualBR(),
      diasAtivos: 30
    }

    setMatriculas(prev => [...prev, novaMatricula])
    showToast('Matrícula adicionada com sucesso!', 'success')
    
    // Limpar formulário e fechar modal
    setAddMatriculaForm({ numero: '' })
    setShowAddMatriculaModal(false)
  }, [addMatriculaForm.numero, matriculas, showToast])

  // Função para fechar modal de adicionar matrícula
  const fecharModalAddMatricula = useCallback(() => {
    setShowAddMatriculaModal(false)
    setAddMatriculaForm({ numero: '' })
  }, [])

  // Funções de exclusão
  const confirmarExclusao = useCallback((type: 'user' | 'matricula' | 'pagamento', id: string, name: string) => {
    setDeleteItem({ type, id, name })
    setShowDeleteConfirmModal(true)
  }, [])

  const executarExclusao = useCallback(() => {
    if (!deleteItem) return

    switch (deleteItem.type) {
      case 'user':
        const updatedUsers = users.filter(u => u.id !== deleteItem.id)
        setUsers(updatedUsers)
        showToast('Usuário excluído com sucesso!', 'success')
        break
      case 'matricula':
        if (deleteItem.type === 'matricula') {
          // Marcar como excluída pelo usuário no painel admin
          const updatedMatriculas = matriculas.map(m => {
            if (m.numero === deleteItem.id) {
              return {
                ...m,
                excluida: true,
                dataExclusao: obterDataAtualBR()
              }
            }
            return m
          })
          setMatriculas(updatedMatriculas)
          showToast('Matrícula marcada como excluída pelo usuário!', 'success')
        }
        break
      case 'pagamento':
        const updatedPagamentos = pagamentos.filter(p => p.id !== deleteItem.id)
        setPagamentos(updatedPagamentos)
        showToast('Pagamento excluído com sucesso!', 'success')
        break
    }

    setShowDeleteConfirmModal(false)
    setDeleteItem(null)
  }, [deleteItem, users, matriculas, pagamentos, showToast])

  // Funções de edição de usuário
  const editarUsuario = useCallback((user: UserType) => {
    setEditingUser(user)
    setEditUserForm({
      nome: user.nome,
      email: user.email,
      senha: '',
      tipo: user.tipo,
      ativo: user.ativo,
      bloqueado: user.bloqueado || false,
      statusPagamento: user.statusPagamento || 'pendente'
    })
    setShowEditUserModal(true)
  }, [])

  const salvarEdicaoUsuario = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const updatedUsers = users.map(u => {
      if (u.id === editingUser.id) {
        const updatedUser = {
          ...u,
          nome: editUserForm.nome,
          email: editUserForm.email,
          tipo: editUserForm.tipo,
          ativo: editUserForm.ativo,
          bloqueado: editUserForm.bloqueado,
          statusPagamento: editUserForm.statusPagamento
        }
        
        // Atualizar senha apenas se foi fornecida
        if (editUserForm.senha.trim()) {
          updatedUser.senha = editUserForm.senha
        }
        
        return updatedUser
      }
      return u
    })

    setUsers(updatedUsers)
    showToast('Usuário atualizado com sucesso!', 'success')
    setShowEditUserModal(false)
    setEditingUser(null)
  }, [editingUser, editUserForm, users, showToast])

  // Função para adicionar novo usuário (admin)
  const adicionarNovoUsuario = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserForm.nome.trim() || !newUserForm.email.trim() || !newUserForm.senha.trim()) {
      showToast('Nome, email e senha são obrigatórios', 'error')
      return
    }

    if (!verificarEmail(newUserForm.email)) {
      showToast('Email inválido', 'error')
      return
    }

    if (users.find(u => u.email === newUserForm.email)) {
      showToast('Email já cadastrado', 'error')
      return
    }

    const valorAcesso = newUserForm.valorAcesso ? parseFloat(newUserForm.valorAcesso) : 0
    if (newUserForm.valorAcesso && (isNaN(valorAcesso) || valorAcesso < 0)) {
      showToast('Valor de acesso inválido', 'error')
      return
    }

    const novoUsuario: UserType = {
      id: Date.now().toString(),
      nome: newUserForm.nome,
      email: newUserForm.email,
      senha: newUserForm.senha,
      tipo: newUserForm.tipo,
      ativo: true,
      bloqueado: false,
      dataCreacao: obterDataAtualBR(),
      totalVendas: 0,
      valorArrecadado: 0,
      statusPagamento: 'pendente',
      valorAcesso: valorAcesso > 0 ? valorAcesso : undefined
    }

    setUsers(prev => [...prev, novoUsuario])
    showToast(`Usuário ${novoUsuario.nome} criado com sucesso!${newUserForm.emailVerificado ? ' Email verificado.' : ''}`, 'success')
    
    // Limpar formulário e fechar modal
    setNewUserForm({ nome: '', email: '', senha: '', emailVerificado: false, tipo: 'user', valorAcesso: '' })
    setShowNewUserModal(false)
  }, [newUserForm, users, showToast])

  // Função de logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null)
    setCurrentView('login')
    setLoginError(null)
    showToast('Logout realizado com sucesso!', 'success')
  }, [showToast])

  // Componente do Painel do Usuário
  const UserPanel = useCallback(() => {
    const userMatriculas = matriculas.filter(m => m.usuarioId === currentUser?.id && !m.excluida)

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header Mobile-First */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9ab7f438-6ca1-43b7-b29c-94b2aac7242e.png" 
                  alt="BEMAXX Logo" 
                  className="h-10 w-auto mr-3 drop-shadow-lg bg-white rounded-lg p-1"
                />
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-[#00AEEF] to-white bg-clip-text text-transparent">
                    Sistema de Criação de Contas
                  </h1>
                  <p className="text-sm text-gray-400">Bem-vindo, {currentUser?.nome}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://www.instagram.com/bemaxx.oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
                
                <a
                  href="https://wa.me/5538999671578?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20painel%20bemaxx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Suporte</span>
                </a>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-all duration-200 transform hover:scale-105 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Cards de Indicadores - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] p-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Total de Vendas</p>
                  <p className="text-lg font-bold text-white">{userMatriculas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Valor Arrecadado</p>
                  <p className="text-lg font-bold text-white">
                    R$ {userMatriculas.reduce((acc, m) => acc + (m.valor || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Contas Ativas</p>
                  <p className="text-lg font-bold text-white">
                    {userMatriculas.filter(m => m.diasAtivos > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Dias Médios</p>
                  <p className="text-lg font-bold text-white">
                    {userMatriculas.length > 0 
                      ? Math.round(userMatriculas.reduce((acc, m) => acc + m.diasAtivos, 0) / userMatriculas.length)
                      : 0} dias
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Gerar Matrícula - Mobile Responsive */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Gerar Número de Matrícula</h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={gerarMatricula}
                className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white px-4 py-3 rounded-lg font-semibold hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Matrícula</span>
              </button>
              
              <p className="text-sm text-gray-400 text-center">
                Clique para gerar uma nova matrícula e registrar a venda
              </p>
            </div>
          </div>

          {/* Tabela Minhas Matrículas - Mobile Responsive */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-semibold text-white">Minhas Matrículas</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por matrícula ou cliente..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-white placeholder-gray-400 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-white text-sm"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Matrícula</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pagamento</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data da Venda</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dias Ativos</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {userMatriculas.map((matricula) => (
                    <tr key={matricula.numero} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-medium text-white">{matricula.numero}</span>
                          <button
                            onClick={() => copiarTexto(matricula.numero)}
                            className="p-1 bg-[#00AEEF]/20 hover:bg-[#00AEEF]/30 rounded transition-all duration-200 transform hover:scale-105"
                            title="Copiar número da matrícula"
                          >
                            <Copy className="w-3 h-3 text-[#00AEEF]" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-300">{matricula.clienteNome || '-'}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-300">{matricula.clienteEmail || '-'}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-white">
                          R$ {matricula.valor?.toLocaleString() || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          matricula.metodoPagamento === 'pendente' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' :
                          matricula.metodoPagamento === 'pix' ? 'bg-green-900/50 text-green-300 border border-green-600' :
                          matricula.metodoPagamento === 'cartao' ? 'bg-blue-900/50 text-blue-300 border border-blue-600' :
                          matricula.metodoPagamento === 'dinheiro' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
                          'bg-gray-700 text-gray-300 border border-gray-600'
                        }`}>
                          {matricula.metodoPagamento === 'pendente' ? 'Pendente' :
                           matricula.metodoPagamento === 'pix' ? 'PIX' :
                           matricula.metodoPagamento === 'cartao' ? 'Cartão' :
                           matricula.metodoPagamento === 'dinheiro' ? 'Dinheiro' : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-300">{matricula.dataVenda || '-'}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium ${
                          matricula.diasAtivos > 7 ? 'text-green-400' : 
                          matricula.diasAtivos > 3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {matricula.diasAtivos} dias
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          matricula.diasAtivos > 0 ? 'bg-green-900/50 text-green-300 border border-green-600' : 'bg-red-900/50 text-red-300 border border-red-600'
                        }`}>
                          {matricula.diasAtivos > 0 ? 'Ativa' : 'Expirada'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => confirmarExclusao('matricula', matricula.numero, `Matrícula ${matricula.numero}`)}
                            className="text-red-400 hover:text-red-300 transition-all duration-200 transform hover:scale-110"
                            title="Excluir matrícula"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }, [currentUser, matriculas, searchTerm, dateFilter, gerarMatricula, confirmarExclusao, handleLogout])

  // Componente do Painel Administrativo
  const AdminPanel = useCallback(() => {
    const totalUsuarios = users.length
    const totalMatriculasUsadas = matriculas.filter(m => m.status === 'usado').length
    const totalMatriculasDisponiveis = matriculas.filter(m => m.status === 'disponivel').length
    const receitaTotal = pagamentos.reduce((acc, p) => acc + p.valor, 0)

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header Mobile-First */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9ab7f438-6ca1-43b7-b29c-94b2aac7242e.png" 
                  alt="BEMAXX Logo" 
                  className="h-10 w-auto mr-3 drop-shadow-lg bg-white rounded-lg p-1"
                />
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-[#00AEEF] to-white bg-clip-text text-transparent">
                    Painel Administrativo - Sistema de Criação de Contas
                  </h1>
                  <p className="text-sm text-gray-400">Controle total do sistema</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://www.instagram.com/bemaxx.oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
                
                <a
                  href="https://wa.me/5538999671578?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20painel%20bemaxx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Suporte</span>
                </a>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-all duration-200 transform hover:scale-105 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Cards de Visão Geral - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] p-2 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Total de Usuários</p>
                  <p className="text-lg font-bold text-white">{totalUsuarios}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Matrículas Usadas</p>
                  <p className="text-lg font-bold text-white">{totalMatriculasUsadas}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Matrículas Disponíveis</p>
                  <p className="text-lg font-bold text-white">{totalMatriculasDisponiveis}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 border border-gray-700 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-400">Receita Total</p>
                  <p className="text-lg font-bold text-white">R$ {receitaTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação por Tabs - Mobile Responsive */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 mb-6">
            <div className="border-b border-gray-700">
              <nav className="flex overflow-x-auto px-4">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                  { id: 'users', label: 'Usuários', icon: Users },
                  { id: 'matriculas', label: 'Matrículas', icon: Activity }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap ${
                      selectedTab === tab.id
                        ? 'border-[#00AEEF] text-[#00AEEF]'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Dashboard Geral</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <h4 className="font-medium text-white mb-4">Usuários Mais Ativos</h4>
                      <div className="space-y-3">
                        {users.filter(u => u.tipo === 'user').map((user) => (
                          <div key={user.id} className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{user.nome}</span>
                            <span className="text-sm font-medium text-[#00AEEF]">
                              R$ {user.valorArrecadado.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <h4 className="font-medium text-white mb-4">Estatísticas Rápidas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Taxa de Conversão</span>
                          <span className="text-sm font-medium text-white">
                            {totalMatriculasUsadas > 0 ? Math.round((totalMatriculasUsadas / (totalMatriculasUsadas + totalMatriculasDisponiveis)) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Ticket Médio</span>
                          <span className="text-sm font-medium text-white">
                            R$ {totalMatriculasUsadas > 0 ? Math.round(receitaTotal / totalMatriculasUsadas) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Usuários Ativos</span>
                          <span className="text-sm font-medium text-white">
                            {users.filter(u => u.ativo).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-semibold text-white">Gerenciar Usuários</h3>
                    <button 
                      onClick={() => setShowNewUserModal(true)}
                      className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white px-4 py-2 rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Usuário</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendas</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Arrecadado</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs font-medium text-white">{user.nome}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-300">{user.email}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                user.tipo === 'admin' ? 'bg-purple-900/50 text-purple-300 border-purple-600' : 'bg-blue-900/50 text-blue-300 border-blue-600'
                              }`}>
                                {user.tipo === 'admin' ? 'Admin' : 'Usuário'}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-300">{user.totalVendas}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs font-medium text-white">
                                R$ {user.valorArrecadado.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                  user.ativo ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-red-900/50 text-red-300 border-red-600'
                                }`}>
                                  {user.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                                {user.bloqueado && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 border border-red-600">
                                    Bloqueado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => editarUsuario(user)}
                                  className="text-[#00AEEF] hover:text-[#0088CC] transition-all duration-200 transform hover:scale-110"
                                  title="Editar usuário"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => confirmarExclusao('user', user.id, user.nome)}
                                  className="text-red-400 hover:text-red-300 transition-all duration-200 transform hover:scale-110"
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedTab === 'matriculas' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Gerenciar Matrículas</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Disponíveis: {totalMatriculasDisponiveis} | Usadas: {totalMatriculasUsadas}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowAddMatriculaModal(true)}
                      className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white px-4 py-2 rounded-lg hover:from-[#0088CC] hover:to-[#006699] transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Matrículas</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Número</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendedor</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data de Uso</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {matriculas.map((matricula) => (
                          <tr key={matricula.numero} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-medium text-white">{matricula.numero}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                  matricula.status === 'disponivel' ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-gray-700 text-gray-300 border-gray-600'
                                }`}>
                                  {matricula.status === 'disponivel' ? 'Disponível' : 'Usado'}
                                </span>
                                {matricula.excluida && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 border border-red-600">
                                    Excluída pelo usuário em {matricula.dataExclusao}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-300">
                                {matricula.usuarioId ? users.find(u => u.id === matricula.usuarioId)?.nome : '-'}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-300">{matricula.dataCopia || '-'}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-300">{matricula.clienteNome || '-'}</span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className="text-xs font-medium text-white">
                                R$ {matricula.valor?.toLocaleString() || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => confirmarExclusao('matricula', matricula.numero, `Matrícula ${matricula.numero}`)}
                                  className="text-red-400 hover:text-red-300 transition-all duration-200 transform hover:scale-110"
                                  title="Excluir matrícula"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }, [users, matriculas, pagamentos, selectedTab, editarUsuario, confirmarExclusao, handleLogout])

  return (
    <div className="min-h-screen">
      <Toast toast={toast} />
      
      {currentView === 'login' && (
        <LoginForm 
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loginError={loginError}
        />
      )}
      {currentView === 'user-panel' && <UserPanel />}
      {currentView === 'admin-panel' && <AdminPanel />}

      {/* Modals */}
      <LoadingModal show={showLoadingModal} />
      <MatriculaModal 
        show={showMatriculaModal}
        onClose={fecharModal}
        onSubmit={finalizarVenda}
        form={matriculaForm}
        setForm={setMatriculaForm}
        matriculaGerada={matriculaGerada}
      />
      <DeleteConfirmModal 
        show={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={executarExclusao}
        item={deleteItem}
      />
      <NewUserModal 
        show={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSubmit={adicionarNovoUsuario}
        form={newUserForm}
        setForm={setNewUserForm}
      />
      <AddMatriculaModal 
        show={showAddMatriculaModal}
        onClose={fecharModalAddMatricula}
        onSubmit={adicionarMatricula}
        form={addMatriculaForm}
        setForm={setAddMatriculaForm}
      />
      <EditUserModal 
        show={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onSubmit={salvarEdicaoUsuario}
        form={editUserForm}
        setForm={setEditUserForm}
      />
    </div>
  )
}