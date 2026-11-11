import { Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DocsList from './pages/DocsList'
import DocEdit from './pages/DocEdit'
import Chantiers from './pages/Chantiers'
import ChantierDetail from './pages/ChantierDetail'
import Clients from './pages/Clients'
import Catalogue from './pages/Catalogue'
import Employes from './pages/Employes'
import PointagePage from './pages/Pointage'
import FraisPage from './pages/Frais'
import Parametres from './pages/Parametres'
import Sauvegarde from './pages/Sauvegarde'
import Corbeille from './pages/Corbeille'
import Archives from './pages/Archives'
import Demandes from './pages/Demandes'
import RealisationsAdmin from './pages/RealisationsAdmin'

/** Chaque document a son propre éditeur : rien ne reste de l'écran précédent. */
function DocEditRoute() {
  const { id } = useParams()
  return <DocEdit key={id} />
}

/** Espace de gestion (admin). */
export default function AdminApp() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="documents/:type" element={<DocsList />} />
        <Route path="documents/:type/:id" element={<DocEditRoute />} />
        <Route path="chantiers" element={<Chantiers />} />
        <Route path="chantiers/:id" element={<ChantierDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="employes" element={<Employes />} />
        <Route path="pointage" element={<PointagePage />} />
        <Route path="frais" element={<FraisPage />} />
        <Route path="demandes" element={<Demandes />} />
        <Route path="realisations" element={<RealisationsAdmin />} />
        <Route path="parametres" element={<Parametres />} />
        <Route path="sauvegarde" element={<Sauvegarde />} />
        <Route path="corbeille" element={<Corbeille />} />
        <Route path="archives" element={<Archives />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
