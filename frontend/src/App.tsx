import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import PaymentSuccess from './pages/PaymentSuccess'
import { useTokenStore } from './stores/tokenStore'

function App() {
  const { initDevice } = useTokenStore()

  useEffect(() => {
    initDevice()
  }, [initDevice])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </Layout>
  )
}

export default App
