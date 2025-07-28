import { Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { HomeScreen, Authentication, UserProfile, CreateResume, TemplateDesign } from '../pages';
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ToastContainer } from "react-toastify";
import { CreateTemplate } from "../pages";
import { HomeContainer } from "../containers";

function App() {

  return (
    <>
      <QueryClientProvider client={new QueryClient()}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes >
            <Route path="/" element={<HomeScreen />} >
              <Route index element={<HomeContainer />} />
              <Route path="/template/create" element={<CreateTemplate />} />
              <Route path="/profile/:uid" element={<UserProfile />} />
              <Route path="/resume/*" element={<CreateResume />} />
              <Route path="/resumeDetails/:templateId" element={<TemplateDesign />} />
            </Route>
            <Route path="/auth" element={<Authentication />} />
          </Routes>
        </Suspense>
        <ToastContainer position="top-right" theme="dark" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export default App
