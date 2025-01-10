import { motion } from 'motion/react'
import Content from './Content'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen bg-transparent overflow-hidden"
    >
      <Sidebar />
      <Content />
    </motion.div>
  )
}

export default Layout
