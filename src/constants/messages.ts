const cannot = (action: string) => `Não foi possível ${action}. Tente de novo.`

export const SUCCESS_MESSAGES = {
  favoritesSaved: 'Favoritos salvos.',
  ratingAddedAsPlaying: 'Jogo adicionado à sua biblioteca como Jogando.',
  ratingSavedAsPlayed: 'Nota salva. O jogo foi marcado como Jogado.',
  statusUpdated: 'Status atualizado.',
  hoursSaved: 'Horas salvas.',
  completedAtSaved: 'Data salva.',
  ratingSaved: 'Nota salva.',
  ratingRemoved: 'Nota removida.',
  reviewSaved: 'Resenha salva.',
  gameAdded: 'Jogo adicionado.',
  platformConnected: (label: string) => `${label} conectada.`,
  reviewRemoved: 'Resenha removida.',
  gameRemoved: 'Jogo removido.',
  platformDisconnected: (label: string) => `${label} desconectada.`,
  verificationLinkSent: (email?: string) =>
    `Enviamos um novo link para ${email || 'o seu email'}.`,
  accountDeleted: 'Sua conta foi excluída.',
  markedAsPlayed: (gameName: string) => `${gameName} marcado como Jogado.`,
  passwordReset: 'Senha redefinida. Entre com a nova senha.',
  profileSaved: 'Perfil salvo.',
  passwordChanged: 'Senha alterada.',
  passwordSet: 'Senha definida.',
  providerLinked: (provider: string) => `${provider} vinculado.`,
  providerUnlinked: (provider: string) => `${provider} desvinculado.`,
  emailChangeRequested: 'Link de confirmação enviado.',
  emailChangeResent: 'Link reenviado.',
  emailChangeCancelled: 'Troca de e-mail cancelada.',
} as const

export const ERROR_MESSAGES = {
  unexpected: 'Algo deu errado. Tente de novo.',
  signIn: 'Não foi possível entrar. Confira o email e a senha.',
  signInFailed: cannot('entrar'),
  changePassword: cannot('salvar a senha'),
  saveFavorites: cannot('salvar os favoritos'),
  toggleFavorite: cannot('atualizar os favoritos'),
  linkProvider: (provider: string) => cannot(`vincular o ${provider}`),
  unlinkProvider: (provider: string) => cannot(`desvincular o ${provider}`),
  requestEmailChange: cannot('pedir a troca de e-mail'),
  resendEmailChange: cannot('reenviar o link'),
  cancelEmailChange: cannot('cancelar a troca'),
  sendEmail:
    'Não foi possível enviar o email agora. Tente de novo em instantes.',
  updateEndless: cannot('atualizar a marca Infinito'),
  updateHundredPercent: cannot('atualizar a marca de 100%'),
  saveHours: cannot('salvar as horas'),
  saveRating: cannot('salvar a nota'),
  removeRating: cannot('remover a nota'),
  saveCompletedAt: cannot('salvar a data'),
  saveProfile: cannot('salvar o perfil'),
  imageRejected:
    'Essa imagem não foi aceita. Selecione um JPG, PNG, GIF ou WebP menor.',
  saveReview: cannot('salvar a resenha'),
  removeReview: cannot('remover a resenha'),
  requestPasswordReset: cannot('pedir a redefinição'),
  resetPassword: cannot('redefinir a senha'),
  follow: cannot('seguir este usuário'),
  unfollow: cannot('deixar de seguir este usuário'),
  updatePlayedCount: cannot('atualizar as zeradas'),
  updateStatus: cannot('atualizar o status'),
  addPlatform: cannot('adicionar a plataforma'),
  updatePlatform: cannot('atualizar a plataforma'),
  removePlatform: cannot('remover a plataforma'),
  connectPlatform: (label: string) => cannot(`conectar ${label}`),
  disconnectPlatform: (label: string) => cannot(`desconectar ${label}`),
  startImport: cannot('iniciar a importação'),
  addGame: cannot('adicionar o jogo'),
  removeGame: cannot('remover o jogo'),
  markAsPlayed: cannot('marcar como Jogado'),
  dismissSuggestion: cannot('dispensar a sugestão'),
  undoSuggestion: cannot('desfazer'),
} as const

export const INFO_MESSAGES = {
  sessionEnded: 'Sua sessão terminou. Entre de novo.',
  invalidLibrarySection:
    'Essa seção não existe. Mostrando toda a sua biblioteca.',
  pageOutOfRange: (page: number | string) =>
    `A página ${page} não existe. Mostrando a última.`,
  platformAdopted: (consoleName: string) =>
    `O registro sem console virou ${consoleName}. Nenhuma plataforma nova foi criada.`,
} as const

export const PROVIDER_LINK_CANCELLED_CODE = 'negado'

export function providerLinkErrorMessage(code: string, provider: string) {
  const messages: Record<string, string> = {
    ja_ligado_outra_conta: `Este ${provider} já está ligado a outra conta do EuZerei.`,
    ja_ligado: `O ${provider} já está vinculado à sua conta.`,
    email_nao_verificado: `O email dessa conta do ${provider} não foi verificado lá. Verifique e tente de novo.`,
    negado: `Vínculo com o ${provider} cancelado.`,
    sessao:
      'Você entrou com outra conta neste navegador. Entre de novo e tente de novo.',
  }
  return Object.prototype.hasOwnProperty.call(messages, code)
    ? messages[code]
    : `Não foi possível vincular o ${provider}. Tente de novo.`
}

export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Login cancelado.',
  email_not_verified:
    'O email dessa conta não foi verificado no provedor. Verifique lá e tente de novo.',
  account_suspended: 'Esta conta está suspensa. Fale com o suporte.',
  rate_limited:
    'O provedor está limitando pedidos agora. Espere alguns minutos e tente de novo.',
  invalid_state:
    'A sessão de login expirou ou foi aberta em outro navegador. Tente de novo.',
  oauth_failed: 'Não foi possível concluir o login com o provedor. Tente de novo.',
}
