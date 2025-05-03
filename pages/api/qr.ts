import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import QRCodeStyling from 'qr-code-styling';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    text = 'https://example.com',
    color = '#000000',
    bgColor = '#ffffff',
    dotStyle = 'dots',
    eye = 'frame0',
    size = '300',
    logo,
  } = req.query;

  const width = parseInt(size as string);
  const height = width;

  const qrCode = new QRCodeStyling({
    width,
    height,
    data: text as string,
    dotsOptions: {
      type: dotStyle as any,
      color: color as string,
    },
    backgroundOptions: {
      color: bgColor as string,
    },
    image: logo ? (logo as string) : undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 10,
    },
    cornersSquareOptions: {
      type: eye as any,
      color: color as string,
    },
  });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setContent('<div id="qr"></div>');
  await page.addScriptTag({ url: 'https://unpkg.com/qr-code-styling/lib/qr-code-styling.js' });

  await page.evaluate(
    ({ qrCodeOptions }) => {
      const qr = new window.QRCodeStyling(qrCodeOptions);
      qr.append(document.getElementById('qr'));
    },
    { qrCodeOptions: qrCode }
  );

  const element = await page.$('#qr');
  const image = await element.screenshot({ type: 'png' });

  await browser.close();

  res.setHeader('Content-Type', 'image/png');
  res.send(image);
}