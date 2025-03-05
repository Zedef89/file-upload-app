// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// Definiamo il tipo di Locals
declare global {
	namespace App {
	  interface Locals {
		csrf?: boolean;
	  }
	}
  }
  
  export {};
