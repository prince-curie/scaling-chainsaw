import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    styles: {
      global: {
        // styles for the `body`
        body: {
            fontFamily: 'Roboto',
            //color: 'black',
        },
        // styles for the `a`
        h2: {
            color: 'blue.600',
            fontWeight: '700',
            margin:'1rem'
        },

        p: {
            color: 'black.500',
        },
        a: {
          color: 'teal.500',
          _hover: {
            textDecoration: 'underline',
          },
        

       
        },
      },
    },
  })

  export default theme;