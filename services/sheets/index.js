import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
]

class GoogleSheetService {
  jwtFromEnv = undefined
  doc = undefined

  constructor(id = undefined) {
    if (!id) {
      throw new Error('ID_UNDEFINED')
    }

    this.jwtFromEnv = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES
    })
    this.doc = new GoogleSpreadsheet(id, this.jwtFromEnv)
  }

  /**
   * Conseguir el menu a partir del excel

   */
  retriveDayMenu = async () => {
    try {
      const list = []
      await this.doc.loadInfo()
      const sheet = this.doc.sheetsByIndex[0] // the first sheet
      await sheet.loadCells('A1:A15')
      await sheet.loadCells('B1:B15')
      const rows = await sheet.getRows()

      for (const a of Array.from(Array(rows.length).keys())) {
        const cellA1 = sheet.getCell(a + 1, 0)
        const cellB1 = sheet.getCell(a + 1, 1)
        const product = String(cellA1.value).concat(' - ', String(cellB1.value))

        list.push(product)
      }

      return list
    } catch (err) {
      console.log(err)
      return undefined
    }
  }

  /**
   * Guardar pedido
   * @param {*} data
   */
  saveOrder = async (data = {}) => {
    console.log('Data: ', data)
    await this.doc.loadInfo()
    const sheet = this.doc.sheetsByIndex[1] // the second sheet

    const order = await sheet.addRow({
      fecha: data.fecha,
      telefono: data.telefono,
      nombre: data.nombre,
      pedido: data.pedido,
      especificacion: data.especificacion,
      cantidad: data.cantidad,
      tipoPago: data.tipoPago,
      observaciones: data.observaciones
    })

    return order
  }
}

export default GoogleSheetService
