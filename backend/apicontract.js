const API_ROUTES = {
  auth: {
    login: {
      method: "POST",
      endpoint: "/api/auth/login",
      description:
        "Autentica a un usuario en el sistema. Verifica las credenciales (email y contraseña) y devuelve un token JWT si son válidas.",
      requiresAuth: false,
      queryParams: [],
      requestExample: {
        body: {
          email: "joao.silva@email.com",
          password: "senha123",
        },
      },
      responseExample: {
        status: 200,
        body: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            id: 1,
            name: "João Silva",
            email: "joao.silva@email.com",
            role: "administrador",
          },
        },
      },
      errors: [
        {
          status: 401,
          message: "Credenciales inválidas",
          body: { message: "Credenciales inválidas" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    logout: {
      method: "POST",
      endpoint: "/api/auth/logout",
      description:
        "Cierra la sesión de un usuario. En una API REST, esta acción suele manejarse en el cliente eliminando el token, por lo que la respuesta es solo informativa.",
      requiresAuth: false,
      queryParams: [],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          message: "Logout realizado con éxito",
        },
      },
      errors: [],
    },
  },
  users: {
    // Rutas de usuarios ya proporcionadas anteriormente...
    list: {
      method: "GET",
      endpoint: "/api/users",
      description:
        "Lista todos los usuarios del sistema con paginación. Devuelve una lista paginada de usuarios, incluyendo su nombre, email, rol y estado (activo/inactivo). Los resultados están ordenados alfabéticamente por nombre.",
      requiresAuth: true,
      queryParams: [
        {
          name: "page",
          type: "integer",
          required: false,
          default: 1,
          description: "Número de página",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          data: [
            {
              id: 1,
              nome: "João Silva",
              email: "joao.silva@email.com",
              funcao: "administrador",
              ativo: true,
            },
            {
              id: 2,
              nome: "Maria Oliveira",
              email: "maria.oliveira@email.com",
              funcao: "funcionário",
              ativo: true,
            },
          ],
          pagination: {
            total: 25,
            pages: 3,
            current: 1,
          },
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    create: {
      method: "POST",
      endpoint: "/api/users",
      description:
        "Crea un nuevo usuario en el sistema. Registra un nuevo usuario con nombre, email, contraseña y rol. Verifica que el email no esté previamente registrado.",
      requiresAuth: true,
      queryParams: [],
      requestExample: {
        body: {
          nome: "Ana Costa",
          email: "ana.costa@email.com",
          senha: "senha123",
          funcao: "funcionário",
        },
      },
      responseExample: {
        status: 201,
        body: {
          id: 3,
          message: "Usuario creado con éxito",
        },
      },
      errors: [
        {
          status: 400,
          message: "Datos inválidos",
          body: { message: "Datos inválidos" },
        },
        {
          status: 409,
          message: "E-mail ya está registrado",
          body: { message: "E-mail ya está registrado" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    update: {
      method: "PUT",
      endpoint: "/api/users/:id",
      description:
        "Actualiza un usuario existente. Permite actualizar uno o más campos de un usuario (nombre, email, contraseña, rol o estado activo). El rol (`funcao`) debe existir en la tabla `roles`.",
      requiresAuth: true,
      pathParams: [
        {
          name: "id",
          type: "integer",
          required: true,
          description: "Identificador del usuario",
        },
      ],
      requestExample: {
        body: {
          nome: "Ana Costa Atualizada",
          email: "ana.costa.novo@email.com",
          senha: "novaSenha456",
          funcao: "administrador",
          ativo: false,
        },
      },
      responseExample: {
        status: 200,
        body: {
          message: "Usuario actualizado con éxito",
        },
      },
      errors: [
        {
          status: 400,
          message: "No se proporcionaron datos para actualizar",
          body: { message: "No se proporcionaron datos para actualizar" },
        },
        {
          status: 400,
          message: "Rol no encontrado",
          body: { message: "Rol no encontrado" },
        },
        {
          status: 404,
          message: "Usuario no encontrado",
          body: { message: "Usuario no encontrado" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    delete: {
      method: "DELETE",
      endpoint: "/api/users/:id",
      description:
        "Elimina un usuario del sistema. Elimina un usuario por su ID y devuelve los datos del usuario eliminado. (Nota: El código tiene un error al intentar devolver `funcao` directamente; debería unirse con `roles`.)",
      requiresAuth: true,
      pathParams: [
        {
          name: "id",
          type: "integer",
          required: true,
          description: "Identificador del usuario",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          data: {
            id: 3,
            name: "Ana Costa",
            email: "ana.costa@email.com",
            funcao: "funcionário",
            ativo: true,
          },
          message: "Usuario eliminado con éxito",
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
  },
  products: {
    list: {
      method: "GET",
      endpoint: "/api/products",
      description:
        "Lista todos los productos del sistema con paginación y filtros opcionales. Devuelve una lista de productos con su nombre, categoría, precio, stock y umbral de alerta, ordenados alfabéticamente por nombre.",
      requiresAuth: true,
      queryParams: [
        {
          name: "search",
          type: "string",
          required: false,
          description: "Filtro por nombre del producto (búsqueda parcial)",
        },
        {
          name: "category",
          type: "string",
          required: false,
          description: "Filtro por nombre de categoría",
        },
        {
          name: "page",
          type: "integer",
          required: false,
          default: 1,
          description: "Número de página",
        },
        {
          name: "limit",
          type: "integer",
          required: false,
          default: 10,
          description: "Cantidad de productos por página",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          data: [
            {
              id: 1,
              name: "Celular Samsung",
              category_id: 1,
              category_name: "Eletrônicos",
              price: 1500.99,
              stock: 50,
              alert_threshold: 10,
              created_at: "2025-03-04T12:00:00Z",
              updated_at: "2025-03-04T12:00:00Z",
            },
            {
              id: 2,
              name: "Camiseta Azul",
              category_id: 2,
              category_name: "Roupas",
              price: 49.9,
              stock: 100,
              alert_threshold: 20,
              created_at: "2025-03-04T12:00:00Z",
              updated_at: "2025-03-04T12:00:00Z",
            },
          ],
          pagination: {
            total: 25,
            pages: 3,
            current: 1,
          },
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    create: {
      method: "POST",
      endpoint: "/api/products",
      description:
        "Crea un nuevo producto en el sistema. Registra un producto con nombre, categoría, precio, stock y umbral de alerta.",
      requiresAuth: true,
      queryParams: [],
      requestExample: {
        body: {
          name: "Notebook Dell",
          category_id: 1,
          price: 3500.0,
          stock: 30,
          alert_threshold: 5,
        },
      },
      responseExample: {
        status: 201,
        body: {
          id: 3,
          message: "Producto creado con éxito",
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    update: {
      method: "PUT",
      endpoint: "/api/products/:id",
      description:
        "Actualiza un producto existente. Permite actualizar todos los campos de un producto (nombre, categoría, precio, stock y umbral de alerta).",
      requiresAuth: true,
      pathParams: [
        {
          name: "id",
          type: "integer",
          required: true,
          description: "Identificador del producto",
        },
      ],
      requestExample: {
        body: {
          name: "Notebook Dell Pro",
          category_id: 1,
          price: 3800.0,
          stock: 25,
          alert_threshold: 10,
        },
      },
      responseExample: {
        status: 200,
        body: {
          message: "Producto actualizado con éxito",
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    delete: {
      method: "DELETE",
      endpoint: "/api/products/:id",
      description: "Elimina un producto del sistema por su ID.",
      requiresAuth: true,
      pathParams: [
        {
          name: "id",
          type: "integer",
          required: true,
          description: "Identificador del producto",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          message: "Producto eliminado con éxito",
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    listCategories: {
      method: "GET",
      endpoint: "/api/categorias",
      description:
        "Lista todas las categorías del sistema. Si se proporciona un filtro de nombre, devuelve solo las categorías que coincidan parcialmente con el término de búsqueda.",
      requiresAuth: true,
      queryParams: [
        {
          name: "name",
          type: "string",
          required: false,
          description: "Filtro por nombre de categoría (búsqueda parcial)",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: [
          {
            id: 1,
            name: "Eletrônicos",
          },
          {
            id: 2,
            name: "Roupas",
          },
        ],
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
  },
  movements: {
    list: {
      method: "GET",
      endpoint: "/api/movements",
      description:
        "Lista todos los movimientos del sistema con paginación y filtros opcionales. Devuelve una lista de movimientos con fecha, producto, tipo, cantidad y usuario, ordenados por fecha descendente.",
      requiresAuth: true,
      queryParams: [
        {
          name: "startDate",
          type: "string",
          required: false,
          description: "Fecha de inicio (formato ISO, ej. 2025-03-01)",
        },
        {
          name: "endDate",
          type: "string",
          required: false,
          description: "Fecha de fin (formato ISO, ej. 2025-03-31)",
        },
        {
          name: "type",
          type: "string",
          required: false,
          description: "Tipo de movimiento ('entrada' o 'saída')",
        },
        {
          name: "product",
          type: "string",
          required: false,
          description: "Filtro por nombre del producto (búsqueda parcial)",
        },
        {
          name: "page",
          type: "integer",
          required: false,
          default: 1,
          description: "Número de página",
        },
        {
          name: "limit",
          type: "integer",
          required: false,
          default: 10,
          description: "Cantidad de movimientos por página",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          data: [
            {
              id: 1,
              movement_date: "2025-03-04T12:00:00Z",
              product: "Celular Samsung",
              type: "entrada",
              quantity: 20,
              user: "João Silva",
            },
            {
              id: 2,
              movement_date: "2025-03-03T15:00:00Z",
              product: "Camiseta Azul",
              type: "saída",
              quantity: 5,
              user: "Maria Oliveira",
            },
          ],
          pagination: {
            total: 50,
            pages: 5,
            current: 1,
          },
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    create: {
      method: "POST",
      endpoint: "/api/movements",
      description:
        "Registra un nuevo movimiento en el sistema. Crea un movimiento con producto, tipo, cantidad, notas y el ID del usuario autenticado.",
      requiresAuth: true,
      queryParams: [],
      requestExample: {
        body: {
          product_id: 1,
          type: "entrada",
          quantity: 20,
          notes: "Recebido do fornecedor",
        },
      },
      responseExample: {
        status: 201,
        body: {
          id: 3,
          message: "Movimiento registrado con éxito",
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
  },
  cashClosures: {
    create: {
      method: "POST",
      endpoint: "/api/cash-closing",
      description:
        "Registra un nuevo cierre de caja para una fecha específica. Calcula un resumen de movimientos (total, entradas, salidas y valor total) basado en los movimientos del día y lo almacena.",
      requiresAuth: true,
      queryParams: [],
      requestExample: {
        body: {
          data: "2025-03-04",
          observacoes: "Fechamento normal",
        },
      },
      responseExample: {
        status: 201,
        body: {
          id: 1,
          resumo: {
            totalMovimentos: 25,
            entradas: 15,
            saidas: 10,
            valorTotal: 3000.0,
          },
          message: "Fechamento realizado com sucesso",
        },
      },
      errors: [
        {
          status: 400,
          message: "Fecha requerida",
          body: { message: "Fecha requerida" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    list: {
      method: "GET",
      endpoint: "/api/cash-closing",
      description:
        "Lista todos los cierres de caja con paginación y filtros opcionales por rango de fechas. Devuelve una lista con fecha, total de movimientos, valor total y usuario, ordenados por fecha descendente.",
      requiresAuth: true,
      queryParams: [
        {
          name: "startDate",
          type: "string",
          required: false,
          description: "Fecha de inicio (formato ISO, ej. 2025-03-01)",
        },
        {
          name: "endDate",
          type: "string",
          required: false,
          description: "Fecha de fin (formato ISO, ej. 2025-03-31)",
        },
        {
          name: "page",
          type: "integer",
          required: false,
          default: 1,
          description: "Número de página",
        },
        {
          name: "limit",
          type: "integer",
          required: false,
          default: 10,
          description: "Cantidad de cierres por página",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          data: [
            {
              id: 1,
              data: "2025-03-04T18:00:00Z",
              totalMovimentos: 25,
              valorTotal: 3000.0,
              usuario: 1,
            },
            {
              id: 2,
              data: "2025-03-03T18:00:00Z",
              totalMovimentos: 20,
              valorTotal: 2500.5,
              usuario: 2,
            },
          ],
          pagination: {
            total: 15,
            pages: 2,
            current: 1,
          },
        },
      },
      errors: [
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
  },
  analytics: {
    summary: {
      method: "GET",
      endpoint: "/api/analytics/summary",
      description:
        "Proporciona un resumen analítico de productos y movimientos basado en un período específico (día, semana, mes o año). Incluye total de productos, valor total del inventario, movimientos (entradas y salidas) y alertas de stock bajo.",
      requiresAuth: true,
      queryParams: [
        {
          name: "period",
          type: "string",
          required: true,
          description: "Período de análisis ('day', 'week', 'month', 'year')",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          totalProdutos: 50,
          valorTotal: 75000.5,
          movimentos: {
            entradas: 200,
            saidas: 150,
          },
          alertas: 5,
        },
      },
      errors: [
        {
          status: 400,
          message: "Período inválido",
          body: { message: "Período inválido" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
    movements: {
      method: "GET",
      endpoint: "/api/analytics/movements",
      description:
        "Proporciona un análisis detallado de movimientos por día dentro de un rango de fechas, incluyendo entradas, salidas y valor neto. También incluye totales generales para el período.",
      requiresAuth: true,
      queryParams: [
        {
          name: "startDate",
          type: "string",
          required: true,
          description: "Fecha de inicio (formato ISO, ej. 2025-03-01)",
        },
        {
          name: "endDate",
          type: "string",
          required: true,
          description: "Fecha de fin (formato ISO, ej. 2025-03-31)",
        },
      ],
      requestExample: null,
      responseExample: {
        status: 200,
        body: {
          daily: [
            {
              date: "2025-03-01",
              entradas: 20,
              saidas: 10,
              valor: 1500.0,
            },
            {
              date: "2025-03-02",
              entradas: 15,
              saidas: 5,
              valor: 1200.5,
            },
          ],
          totals: {
            entradas: 35,
            saidas: 15,
            valor: 2700.5,
          },
        },
      },
      errors: [
        {
          status: 400,
          message: "startDate y endDate son requeridos",
          body: { message: "startDate y endDate son requeridos" },
        },
        {
          status: 500,
          message: "Error interno del servidor",
          body: { message: "Error interno del servidor" },
        },
      ],
    },
  },
};

module.exports = API_ROUTES;
