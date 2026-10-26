// A raiz (`/en`, `/pt`) casa com esta folha, e não com o catch-all ao lado: um
// `[...x]` obrigatório não casa com zero segmentos. Sem ela, voltar de
// `/get-quote` à home por clique deixava o slot com a folha de `/get-quote` — e
// a faixa de contacto no footer da home (#14).
export { default } from "./base-footer";
