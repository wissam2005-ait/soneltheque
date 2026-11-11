import { Route, Routes } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { PublicProvider } from './usePublic'
import { Contact, Devis, Home, NotFound, Realisations, Services } from './pages'

export default function SiteApp() {
  return (
    <PublicProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="realisations" element={<Realisations />} />
          <Route path="devis" element={<Devis />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </PublicProvider>
  )
}
