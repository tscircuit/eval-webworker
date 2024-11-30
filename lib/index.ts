import type { AnyCircuitElement } from "circuit-json"                                                          
import * as Comlink from "comlink"                                                                             
import type {                                                                                                  
  InternalWebWorkerApi,                                                                                        
  WebWorkerConfiguration,                                                                                      
  CircuitWebWorker,                                                                                            
} from "./shared/types"                                                                                        
                                                                                                                
export const createCircuitWebWorker = (                                                                        
  configuration: Partial<WebWorkerConfiguration>,                                                              
): CircuitWebWorker => {    
  // TODO implement                                                                                   
 const webWorker = Comlink.wrap<InternalWebWorkerApi>(                                                        
    new Worker(                                                                                                
      configuration.webWorkerUrl ??                                                                            
        "https://unpkg.com/@tscircuit/eval-webworker/dist/webworker/index.js",                                 
    ),                                                                                                         
  )                                                                                                            
                                                                                                               
  // Return the wrapped worker with the correct interface                                                      
  return {                                                                                                     
    execute: async (code: string) => {                                                                         
      if (configuration.snippetsApiBaseUrl) {                                                                  
        await webWorker.setSnippetsApiBaseUrl(configuration.snippetsApiBaseUrl)                                
      }                                                                                                        
      return webWorker.execute(code)                                                                           
    },         
   // TODO set up listeners to track render state
    renderUntilSettled: () => webWorker.renderUntilSettled(),                                                  
    getCircuitJson: () => webWorker.getCircuitJson(),                                                          
  }                                                                                                            
}                                                                                                              
                                                                                                                
