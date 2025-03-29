export const API_ROUTES = {
  // Autenticación
  AUTH: {
    LOGIN: {
      path: "/auth/login",
      method: "POST",
      body: {
        email: "string",
        password: "string",
      },
      response: {
        token: "string",
        user: {
          id: "number",
          nome: "string",
          email: "string",
          funcao: "administrador | funcionario",
        },
      },
      errors: {
        401: "Credenciais inválidas",
        422: "Dados inválidos",
      },
    },
    LOGOUT: {
      path: "/auth/logout",
      method: "POST",
      response: {
        message: "Logout realizado com sucesso",
      },
    },
  },

  // Produtos
  PRODUCTS: {
    LIST: {
      path: "/products",
      method: "GET",
      query: {
        search: "string?",
        categoria: "string?",
        page: "number?",
        limit: "number?",
      },
      response: {
        data: [
          {
            id: "number",
            nome: "string",
            categoria: "string",
            preco: "number",
            estoque: "number",
            alerta: "number",
          },
        ],
        pagination: {
          total: "number",
          pages: "number",
          current: "number",
        },
      },
    },
    CREATE: {
      path: "/products",
      method: "POST",
      body: {
        nome: "string",
        categoria: "string",
        preco: "number",
        estoque: "number",
        alerta: "number",
      },
      response: {
        id: "number",
        message: "Produto criado com sucesso",
      },
      errors: {
        400: "Dados inválidos",
        409: "Produto já existe",
      },
    },
    UPDATE: {
      path: "/products/:id",
      method: "PUT",
      params: {
        id: "number",
      },
      body: {
        nome: "string?",
        categoria: "string?",
        preco: "number?",
        estoque: "number?",
        alerta: "number?",
      },
      response: {
        message: "Produto atualizado com sucesso",
      },
      errors: {
        404: "Produto não encontrado",
        400: "Dados inválidos",
      },
    },
    DELETE: {
      path: "/products/:id",
      method: "DELETE",
      params: {
        id: "number",
      },
      response: {
        message: "Produto excluído com sucesso",
      },
      errors: {
        404: "Produto não encontrado",
      },
    },
  },

  // Movimentos
  MOVEMENTS: {
    LIST: {
      path: "/movimentos",
      method: "GET",
      query: {
        startDate: "string?",
        endDate: "string?",
        tipo: "entrada | saida?",
        produto: "string?",
        page: "number?",
        limit: "number?",
      },
      response: {
        data: [
          {
            id: "number",
            data: "string",
            produto: "string",
            tipo: "entrada | saida",
            quantidade: "number",
            usuario: "string",
          },
        ],
        pagination: {
          total: "number",
          pages: "number",
          current: "number",
        },
      },
    },
    CREATE: {
      path: "/movements",
      method: "POST",
      body: {
        product_id: "number",
        type: "entrada | saida",
        quantity: "number",
        notes: "string?",
      },
      response: {
        id: "number",
        message: "Movimento registrado com sucesso",
      },
      errors: {
        400: "Dados inválidos",
        404: "Produto não encontrado",
        422: "Estoque insuficiente",
      },
    },
  },

  // Análises
  ANALYTICS: {
    SUMMARY: {
      path: "/analytics/summary",
      method: "GET",
      query: {
        period: "day | week | month | year",
      },
      response: {
        totalProdutos: "number",
        valorTotal: "number",
        movimentos: {
          entradas: "number",
          saidas: "number",
        },
        alertas: "number",
      },
    },
    MOVEMENTS: {
      path: "/analytics/movements",
      method: "GET",
      query: {
        startDate: "string",
        endDate: "string",
      },
      response: {
        daily: [
          {
            date: "string",
            entradas: "number",
            saidas: "number",
            valor: "number",
          },
        ],
        totals: {
          entradas: "number",
          saidas: "number",
          valor: "number",
        },
      },
    },
  },

  // Usuários
  USERS: {
    LIST: {
      path: "/users",
      method: "GET",
      query: {
        search: "string?",
        funcao: "string?",
        status: "ativo | inativo?",
        page: "number?",
        limit: "number?",
      },
      response: {
        data: [
          {
            id: "number",
            name: "string",        // Cambiado de 'nome' a 'name'
            email: "string",
            role: "administrador | funcionario", // Cambiado de 'funcao' a 'role'
            is_active: "boolean", // Cambiado de 'ativo' a 'is_active'
          },
        ],
        pagination: {
          total: "number",
          pages: "number",
          current: "number",
        },
      },
    },
    CREATE: {
      path: "/users",
      method: "POST",
      body: {
        name: "string",        // Cambiado de 'nome' a 'name'
        email: "string",
        password: "string",    // Cambiado de 'senha' a 'password'
        role: "administrador | funcionario", // Cambiado de 'funcao' a 'role'
      },
      response: {
        id: "number",
        message: "Usuário criado com sucesso",
      },
      errors: {
        400: "Dados inválidos",
        409: "E-mail já cadastrado",
      },
    },
    UPDATE: {
      path: "/users/:id",
      method: "PUT",
      params: {
        id: "number",
      },
      body: {
        name: "string?",        // Cambiado de 'nome' a 'name'
        email: "string?",
        password: "string?",    // Cambiado de 'senha' a 'password'
        role: "administrador | funcionario?", // Cambiado de 'funcao' a 'role'
        is_active: "boolean?", // Cambiado de 'ativo' a 'is_active'
      },
      response: {
        message: "Usuário atualizado com sucesso",
      },
      errors: {
        404: "Usuário não encontrado",
        400: "Dados inválidos",
      },
    },
  },

  // Categorias
  CATEGORIES: {
    LIST: {
      path: "/categorias",
      method: "GET",
      response: {
        data: [
          {
            id: "number",
            nome: "string",
            descricao: "string",
          },
        ],
      },
    },
    CREATE: {
      path: "/categorias",
      method: "POST",
      body: {
        nome: "string",
        descricao: "string",
      },
      response: {
        id: "number",
        message: "Categoria criada com sucesso",
      },
    },
    UPDATE: {
      path: "/categorias/:id",
      method: "PUT",
      params: {
        id: "number",
      },
      body: {
        nome: "string?",
        descricao: "string?",
      },
      response: {
        message: "Categoria atualizada com sucesso",
      },
    },
    DELETE: {
      path: "/categorias/:id",
      method: "DELETE",
      params: {
        id: "number",
      },
      response: {
        message: "Categoria excluída com sucesso",
      },
    },
  },

  // Fechamento de Caixa
  CASH_CLOSING: {
    CREATE: {
      path: "/cash-closing",
      method: "POST",
      body: {
        data: "string",
        observacoes: "string?",
      },
      response: {
        id: "number",
        resumo: {
          totalMovimentos: "number",
          entradas: "number",
          saidas: "number",
          valorTotal: "number",
        },
        message: "Fechamento realizado com sucesso",
      },
    },
    LIST: {
      path: "/cash-closing",
      method: "GET",
      query: {
        startDate: "string?",
        endDate: "string?",
        page: "number?",
        limit: "number?",
      },
      response: {
        data: [
          {
            id: "number",
            data: "string",
            totalMovimentos: "number",
            valorTotal: "number",
            usuario: "string",
          },
        ],
        pagination: {
          total: "number",
          pages: "number",
          current: "number",
        },
      },
    },
  },
}

