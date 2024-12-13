import Content from './Content'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar />
      <Content />
    </div>
  )
}

export default Layout
