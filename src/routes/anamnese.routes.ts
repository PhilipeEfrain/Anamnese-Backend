import { Router } from "express";
import * as controller from "../controllers/anamnese.controller";
import { authenticateVet } from "../middleware/auth";
import { createAnamneseLimiter } from "../middleware/rateLimiter";
import { validateAnamneseCreation } from "../middleware/validators";

const router = Router();

/**
 * @swagger
 * /anamnese:
 *   post:
 *     summary: Criar nova anamnese (rota pública)
 *     description: Permite que tutores preencham anamnese antes da consulta
 *     tags: [Anamneses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pet
 *               - reason
 *             properties:
 *               pet:
 *                 type: string
 *                 description: ID do pet
 *                 example: 507f1f77bcf86cd799439011
 *               reason:
 *                 type: string
 *                 description: Motivo da consulta
 *                 example: Vômito e diarreia há 2 dias
 *               clinicalHistory:
 *                 type: object
 *                 properties:
 *                   previousIllnesses:
 *                     type: string
 *                     example: Nenhuma
 *                   surgeries:
 *                     type: string
 *                     example: Castração em 2022
 *                   medications:
 *                     type: string
 *                     example: Antipulgas mensal
 *                   allergies:
 *                     type: string
 *                     example: Nenhuma conhecida
 *               symptoms:
 *                 type: object
 *                 properties:
 *                   vomiting:
 *                     type: boolean
 *                     example: true
 *                   diarrhea:
 *                     type: boolean
 *                     example: true
 *                   lethargy:
 *                     type: boolean
 *                     example: true
 *                   appetiteLoss:
 *                     type: boolean
 *                     example: false
 *                   coughing:
 *                     type: boolean
 *                     example: false
 *                   sneezing:
 *                     type: boolean
 *                     example: false
 *               physicalExam:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                     example: 38.5
 *                   heartRate:
 *                     type: number
 *                     example: 120
 *                   respiratoryRate:
 *                     type: number
 *                     example: 30
 *                   mucousMembranes:
 *                     type: string
 *                     example: Rosadas
 *                   hydrationStatus:
 *                     type: string
 *                     example: Normal
 *     responses:
 *       201:
 *         description: Anamnese criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anamnese'
 *       400:
 *         description: Validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Muitas requisições
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
router.post(
  "/",
  createAnamneseLimiter,
  validateAnamneseCreation,
  controller.createAnamnese
);

/**
 * @swagger
 * /anamnese:
 *   get:
 *     summary: Listar todas as anamneses com paginação
 *     tags: [Anamneses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *         description: Busca por motivo, avaliação, diagnóstico ou tratamento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do filtro
 *         example: 2024-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do filtro
 *         example: 2024-12-31
 *     responses:
 *       200:
 *         description: Lista de anamneses retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Anamnese'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Não autorizado
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
router.get("/", authenticateVet, controller.getAll);

/**
 * @swagger
 * /anamnese/{id}:
 *   get:
 *     summary: Buscar anamnese por ID
 *     tags: [Anamneses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da anamnese
 *     responses:
 *       200:
 *         description: Anamnese encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anamnese'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Anamnese não encontrada
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
router.get("/:id", authenticateVet, controller.getById);

export default router;
