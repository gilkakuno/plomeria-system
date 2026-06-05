import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiAgentService {
  constructor(private configService: ConfigService) {}

  async analyzeBudgetRequest(description: string, availableMaterials: any[]): Promise<any> {
    const apiKey = this.configService.get('OPENAI_API_KEY');

    const materialsContext = availableMaterials
      .slice(0, 50)
      .map((m) => `- ${m.name} (${m.unit}, precio: Bs.${m.salePrice})`)
      .join('\n');

    const systemPrompt = `Eres un asistente experto en plomería boliviana. 
Tu tarea es analizar una descripción de trabajo de plomería y sugerir una lista de materiales necesarios.
Responde ÚNICAMENTE con JSON válido, sin texto adicional.

Materiales disponibles en inventario:
${materialsContext}

Formato de respuesta requerido:
{
  "trabajoDescrito": "resumen del trabajo",
  "materialesSugeridos": [
    {"nombre": "nombre del material", "cantidad": número, "motivo": "por qué se necesita"}
  ],
  "notasAdicionales": "observaciones del plomero",
  "tiempoEstimado": "estimación de tiempo"
}`;

    // If no API key configured, return mock response
    if (!apiKey || apiKey === 'tu_openai_api_key') {
      return this.getMockResponse(description);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: description },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI error:', error.message);
      return this.getMockResponse(description);
    }
  }

  private getMockResponse(description: string) {
    // Intelligent mock based on keywords, mapping to exact database seed names
    const materials = [];
    const lower = description.toLowerCase();

    if (lower.includes('ducha') || lower.includes('baño')) {
      materials.push(
        { nombre: 'CAÑERIAS 1/2', cantidad: 6, motivo: 'Red de agua fría para ducha' },
        { nombre: 'CODO FF', cantidad: 8, motivo: 'Cambios de dirección' },
        { nombre: 'LLAVE DE PASO', cantidad: 2, motivo: 'Control de agua por zona' },
        { nombre: '"T" FF', cantidad: 3, motivo: 'Distribución de caudal' },
      );
    }
    if (lower.includes('lavaplatos') || lower.includes('cocina')) {
      materials.push(
        { nombre: 'CODO PAVCO', cantidad: 4, motivo: 'Desagüe de lavaplatos' },
        { nombre: '"T" PAVCO', cantidad: 2, motivo: 'Sello hidráulico antiolor' },
        { nombre: 'CAÑERIAS 3/4', cantidad: 2, motivo: 'Conexión a grifería' },
      );
    }
    if (lower.includes('tubería') || lower.includes('caño')) {
      materials.push(
        { nombre: 'CAÑERIAS 3/4', cantidad: 4, motivo: 'Tubería principal' },
        { nombre: 'CAÑERIA DE 1/2 HIDRO 3', cantidad: 3, motivo: 'Tubería de agua caliente' },
      );
    }

    if (materials.length === 0) {
      materials.push(
        { nombre: 'CAÑERIAS 1/2', cantidad: 4, motivo: 'Tubería general' },
        { nombre: 'CODO FF', cantidad: 4, motivo: 'Conexiones' },
      );
    }

    return {
      trabajoDescrito: description,
      materialesSugeridos: materials,
      notasAdicionales: 'Revisar presión de agua antes de iniciar. Verificar stock antes de confirmar presupuesto.',
      tiempoEstimado: '1-2 días de trabajo',
    };
  }
}
