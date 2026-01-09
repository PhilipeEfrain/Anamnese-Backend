import { Router } from "express";
import {
  registerVet,
  loginVet,
  refreshAccessToken,
  logout,
  getAllVets,
} from "../controllers/vet.controller";
import { authLimiter } from "../middleware/rateLimiter";
import {
  validateVetRegistration,
  validateVetLogin,
  validateRefreshToken,
} from "../middleware/validators";

const router = Router();

/**
 * @swagger
 * /vet/register:
 *   post:
 *     summary: Registrar novo veterinário
 *     tags: [Veterinários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - crmv
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. João Silva
 *               crmv:
 *                 type: string
 *                 example: 12345-SP
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@vet.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Senha@123!
 *     responses:
 *       201:
 *         description: Veterinário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VetResponse'
 *       400:
 *         description: Email já cadastrado ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", authLimiter, validateVetRegistration, registerVet);

/**
 * @swagger
 * /vet/login:
 *   post:
 *     summary: Login de veterinário
 *     tags: [Veterinários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@vet.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Senha@123!
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Senha incorreta ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", authLimiter, validateVetLogin, loginVet);

/**
 * @swagger
 * /vet/refresh:
 *   post:
 *     summary: Renovar access token
 *     description: Utiliza o refresh token para obter um novo access token
 *     tags: [Veterinários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: number
 *                   example: 3600
 *       400:
 *         description: Refresh token não fornecido ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Veterinário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", validateRefreshToken, refreshAccessToken);

/**
 * @swagger
 * /vet/logout:
 *   post:
 *     summary: Logout de veterinário
 *     description: Invalida o refresh token
 *     tags: [Veterinários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       400:
 *         description: Refresh token não fornecido ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", validateRefreshToken, logout);

/**
 * @swagger
 * /vet/list:
 *   get:
 *     summary: Listar todos os veterinários cadastrados
 *     tags: [Veterinários]
 *     responses:
 *       200:
 *         description: Lista de veterinários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VetListItem'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/list", getAllVets);

export default router;
