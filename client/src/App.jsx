// // import { Routes, Route } from 'react-router-dom';
// // import { ChakraProvider } from '@chakra-ui/react';
// // import { AuthProvider } from './context/AuthContext';
// // import Navbar from './components/Navbar';
// // import Home from './pages/Home';
// // import Login from './pages/Login';
// // import Register from './pages/Register';
// // import ProductExplorer from './pages/ProductExplorer';
// // import Watchlist from './pages/Watchlist';
// // import { Box } from '@chakra-ui/react';

// // function App() {
// //   return (
// //     <ChakraProvider>
// //       <AuthProvider>
// //         <Box minH="100vh">
// //           <Navbar />
// //           <Routes>
// //             <Route path="/" element={<Home />} />
// //             <Route path="/login" element={<Login />} />
// //             <Route path="/register" element={<Register />} />
// //             <Route path="/explorer" element={<ProductExplorer />} />
// //             <Route path="/watchlist" element={<Watchlist />} />
// //           </Routes>
// //         </Box>
// //       </AuthProvider>
// //     </ChakraProvider>
// //   );
// // }

// // export default App;
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { ChakraProvider, Box } from '@chakra-ui/react';
// import { AuthProvider, useAuth } from './context/AuthContext'; // Import useAuth here
// import Navbar from './components/Navbar';
// import LandingPage from './pages/LandingPage';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ProductExplorer from './pages/ProductExplorer';
// import Watchlist from './pages/Watchlist';
// import BudgetBuilder from './pages/BudgetBuilder';

// // Helper Component: Protects routes from non-logged-in users
// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// // Helper Component: Redirects logged-in users away from Landing Page
// const PublicRoute = ({ children }) => {
//   const { user } = useAuth();
//   if (user) {
//     return <Navigate to="/home" replace />;
//   }
//   return children;
// };

// function App() {
//   return (
//     <ChakraProvider>
//       <AuthProvider>
//         <Box minH="100vh">
//           <Navbar />
//           <Routes>
//             {/* PUBLIC ROUTES */}
//             <Route path="/" element={
//               <PublicRoute>
//                 <LandingPage />
//               </PublicRoute>
//             } />
//             <Route path="/login" element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             } />
//             <Route path="/register" element={
//               <PublicRoute>
//                 <Register />
//               </PublicRoute>
//             } />

//             {/* PROTECTED ROUTES (Only for Logged In Users) */}
//             <Route path="/home" element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             } />
//             <Route path="/explorer" element={
//               <ProtectedRoute>
//                 <ProductExplorer />
//               </ProtectedRoute>
//             } />
//             <Route path="/watchlist" element={
//               <ProtectedRoute>
//                 <Watchlist />
//               </ProtectedRoute>
//             } />
//             <Route path="/budget" element={
//               <ProtectedRoute>
//                 <BudgetBuilder />
//               </ProtectedRoute>
//             } />

//             {/* CATCH ALL - Redirect to Home */}
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </Box>
//       </AuthProvider>
//     </ChakraProvider>
//   );
// }

// export default App;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Spinner } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductExplorer from './pages/ProductExplorer';
import Watchlist from './pages/Watchlist';
import BudgetBuilder from './pages/BudgetBuilder';

// 1. Loading Spinner Component (Prevents blank screens)
const LoadingScreen = () => (
  <Flex justify="center" align="center" h="100vh" bg="gray.50">
    <Spinner size="xl" color="blue.500" thickness="4px" />
  </Flex>
);

// 2. Protected Route (For Dashboard, etc.)
// If loading -> Show Spinner
// If not logged in -> Go to Login
// If logged in -> Show Page
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// 3. Public Route (For Landing, Login, Register)
// If loading -> Show Spinner
// If logged in -> Go to Home (Dashboard)
// If not logged in -> Show Page
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/home" replace />;

  return children;
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Box minH="100vh">
          <Navbar />
          <Routes>
            {/* --- PUBLIC ROUTES (Accessible only when LOGGED OUT) --- */}
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* --- PROTECTED ROUTES (Accessible only when LOGGED IN) --- */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/explorer" element={
              <ProtectedRoute>
                <ProductExplorer />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <BudgetBuilder />
              </ProtectedRoute>
            } />

            {/* Catch All: Send to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;