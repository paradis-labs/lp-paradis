## 1. Antes da migração (independentes entre si)

- [ ] 1.1 `fix-quote-requests-public-create` aplicada e arquivada
- [ ] 1.2 `fix-wave-0-independent-issues` aplicada e arquivada (PRs A, B, C)
- [ ] 1.3 `fix-footer-slot-soft-navigation` aplicada e arquivada

## 2. Costura e cache (no site)

- [ ] 2.1 `cms-phase-0a-content-seam` aplicada e arquivada (depende de 1.3)
- [ ] 2.2 `cms-phase-0b-content-cache` aplicada e arquivada (depende de 2.1)

## 3. hcms (fora do site; em paralelo com a secção 2)

- [ ] 3.1 Completar o Why com as motivações adicionais e combinar quem administra o hcms
- [ ] 3.2 `cms-phase-1-hcms-alignment` aplicada e arquivada
- [ ] 3.3 `cms-phase-2-content-verification` aplicada e arquivada (depende de 3.2)

## 4. Troca

- [ ] 4.1 `cms-phase-3-directus-provider` aplicada e arquivada (depende de 2.2, 3.2 e 3.3)
- [ ] 4.2 `cms-phase-4-cutover` aplicada; janela de rollback fechada sem rollback; arquivada

## 5. Limpeza

- [ ] 5.1 `cms-phase-5-remove-payload` aplicada e arquivada (depende de 4.2)
- [ ] 5.2 Arquivar este roadmap
