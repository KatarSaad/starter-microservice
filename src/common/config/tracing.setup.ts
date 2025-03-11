import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

// Step 1: Create a new Tracer Provider
const provider = new NodeTracerProvider();

// Step 2: Configure the Jaeger Exporter
const exporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces', // Jaeger collector endpoint
});

// Step 3: Add the exporter to the provider
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Step 4: Register the tracer provider
provider.register();

// Step 5: Auto Instrument NestJS and HTTP Requests
registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new NestInstrumentation()],
});

console.log('✅ OpenTelemetry Tracing Initialized');

export default provider;
