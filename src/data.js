export const companies = [
  { id: 1, name: 'Doce Canela Ltda', cnpj: '12.345.678/0001-90', status: 'Atenção' },
  { id: 2, name: 'Alfa Comércio Ltda', cnpj: '23.456.789/0001-10', status: 'Em dia' },
  { id: 3, name: 'Beta Serviços Ltda', cnpj: '34.567.890/0001-21', status: 'Crítico' },
  { id: 4, name: 'Gamma Indústria Ltda', cnpj: '45.678.901/0001-32', status: 'Em dia' },
  { id: 5, name: 'Delta Participações Ltda', cnpj: '56.789.012/0001-43', status: 'Atenção' },
]

export const initialTasks = [
  { id: 1, companyId: 1, title: 'Apuração ICMS', area: 'Fiscal', category: 'ICMS', competence: '09/2026', due: '2026-09-10', owner: 'Eduardo', priority: 'Alta', status: 'Em andamento', notes: 'Conferir notas de entrada.' },
  { id: 2, companyId: 1, title: 'Conciliação bancária', area: 'Contábil', category: 'Conciliação bancária', competence: '08/2026', due: '2026-09-12', owner: 'Irmã', priority: 'Média', status: 'Aguardando cliente', notes: 'Falta extrato bancário.' },
  { id: 3, companyId: 2, title: 'EFD Contribuições', area: 'Fiscal', category: 'EFD Contribuições', competence: '08/2026', due: '2026-09-14', owner: 'Eduardo', priority: 'Média', status: 'A fazer', notes: '' },
  { id: 4, companyId: 3, title: 'Fechamento contábil', area: 'Contábil', category: 'Fechamento Contábil', competence: '08/2026', due: '2026-09-08', owner: 'Irmã', priority: 'Alta', status: 'Em revisão', notes: 'Revisar fornecedores.' },
  { id: 5, companyId: 4, title: 'PIS/COFINS', area: 'Fiscal', category: 'PIS/COFINS', competence: '08/2026', due: '2026-09-15', owner: 'Eduardo', priority: 'Baixa', status: 'Concluído', notes: '' },
  { id: 6, companyId: 5, title: 'Balancete', area: 'Contábil', category: 'Balancete', competence: '08/2026', due: '2026-09-13', owner: 'Irmã', priority: 'Média', status: 'Aguardando documento', notes: 'Aguardando contrato de empréstimo.' }
]

export const fiscalCategories = [
  'Importação XML','Escrituração fiscal','Conferência entradas','Conferência saídas',
  'ICMS','ICMS-ST','IPI','PIS','COFINS','EFD ICMS/IPI','EFD Contribuições',
  'DCTFWeb/MIT','Retenções','Fechamento Fiscal'
]

export const accountingCategories = [
  'Importação do movimento','Conciliação bancária','Caixa','Clientes','Fornecedores',
  'Folha','Impostos','Empréstimos','Imobilizado','Depreciação','Balancete','Razão',
  'DRE','Fechamento Contábil'
]
