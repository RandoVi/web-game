export async function fetchHTML(componentName: string) {
  let response: Response = await fetch(`/src/frontend/components/componentsHTML/${componentName}.html`);
  let responseText: string = await response.text();

  return responseText
}