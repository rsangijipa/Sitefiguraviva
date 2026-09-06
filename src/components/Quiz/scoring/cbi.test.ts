import { calculateCBI } from "./cbi";

/**
 * Testes do CBI - Copenhagen Burnout Inventory
 * Validar domínios, reverse scoring, e lógica condicional
 */

describe("CBI Scoring", () => {
  test("all minimum - personal burnout domain", () => {
    const result = calculateCBI({
      pb1: 0,
      pb2: 0,
      pb3: 0,
      pb4: 0,
      pb5: 0,
      pb6: 0,
      wb1: 0,
      wb2: 0,
      wb3: 0,
      wb4: 0,
      wb5: 0,
      wb6: 0,
      wb7: 100, // reverse: 100 becomes 0
      workWithClients: false,
    });

    expect(result.valid).toBe(true);
    expect(result.domains).toHaveLength(2);
    expect(result.domains[0].id).toBe("personal");
    expect(result.domains[0].score).toBe(0);
  });

  test("all maximum - personal and work domains", () => {
    const result = calculateCBI({
      pb1: 100,
      pb2: 100,
      pb3: 100,
      pb4: 100,
      pb5: 100,
      pb6: 100,
      wb1: 100,
      wb2: 100,
      wb3: 100,
      wb4: 100,
      wb5: 100,
      wb6: 100,
      wb7: 0, // reverse: 0 becomes 100
      workWithClients: false,
    });

    expect(result.valid).toBe(true);
    expect(result.domains[0].score).toBe(100); // personal
    expect(result.domains[1].score).toBe(100); // work
  });

  test("WB7 reverse scoring: 100 input becomes 0", () => {
    const result = calculateCBI({
      pb1: 0,
      pb2: 0,
      pb3: 0,
      pb4: 0,
      pb5: 0,
      pb6: 0,
      wb1: 0,
      wb2: 0,
      wb3: 0,
      wb4: 0,
      wb5: 0,
      wb6: 0,
      wb7: 100, // reverse: input 100 -> output 0
      workWithClients: false,
    });

    const workDomain = result.domains[1];
    expect(workDomain.score).toBe(0); // Média com WB7 = 0
  });

  test("WB7 reverse scoring: 0 input becomes 100", () => {
    const result = calculateCBI({
      pb1: 0,
      pb2: 0,
      pb3: 0,
      pb4: 0,
      pb5: 0,
      pb6: 0,
      wb1: 0,
      wb2: 0,
      wb3: 0,
      wb4: 0,
      wb5: 0,
      wb6: 0,
      wb7: 0, // reverse: input 0 -> output 100
      workWithClients: false,
    });

    const workDomain = result.domains[1];
    expect(workDomain.score).toBe(14); // Média arredondada de 100 / 7
  });

  test("client domain skipped when workWithClients = false", () => {
    const result = calculateCBI({
      pb1: 50,
      pb2: 50,
      pb3: 50,
      pb4: 50,
      pb5: 50,
      pb6: 50,
      wb1: 50,
      wb2: 50,
      wb3: 50,
      wb4: 50,
      wb5: 50,
      wb6: 50,
      wb7: 50,
      workWithClients: false,
      // cb1-cb6 não inclusos ou undefined
    });

    expect(result.domains).toHaveLength(2);
    expect(result.domains.find((d) => d.id === "client")).toBeUndefined();
  });

  test("client domain included when workWithClients = true", () => {
    const result = calculateCBI({
      pb1: 50,
      pb2: 50,
      pb3: 50,
      pb4: 50,
      pb5: 50,
      pb6: 50,
      wb1: 50,
      wb2: 50,
      wb3: 50,
      wb4: 50,
      wb5: 50,
      wb6: 50,
      wb7: 50,
      workWithClients: true,
      cb1: 75,
      cb2: 75,
      cb3: 75,
      cb4: 75,
      cb5: 75,
      cb6: 75,
    });

    expect(result.domains).toHaveLength(3);
    const clientDomain = result.domains.find((d) => d.id === "client");
    expect(clientDomain).toBeDefined();
    expect(clientDomain?.score).toBe(75);
  });

  test("insufficient personal responses returns invalid", () => {
    const result = calculateCBI({
      pb1: 50,
      pb2: 50,
      pb3: null as any, // menos de 3
      pb4: null as any,
      pb5: null as any,
      pb6: null as any,
      wb1: 50,
      wb2: 50,
      wb3: 50,
      wb4: 50,
      wb5: 50,
      wb6: 50,
      wb7: 50,
      workWithClients: false,
    });

    expect(result.valid).toBe(false);
  });

  test("insufficient work responses returns invalid", () => {
    const result = calculateCBI({
      pb1: 50,
      pb2: 50,
      pb3: 50,
      pb4: 50,
      pb5: 50,
      pb6: 50,
      wb1: 50,
      wb2: 50,
      wb3: null as any, // menos de 4
      wb4: null as any,
      wb5: null as any,
      wb6: null as any,
      wb7: 50,
      workWithClients: false,
    });

    expect(result.valid).toBe(false);
  });

  test("mid-range scores in all domains", () => {
    const result = calculateCBI({
      pb1: 50,
      pb2: 50,
      pb3: 50,
      pb4: 50,
      pb5: 50,
      pb6: 50,
      wb1: 50,
      wb2: 50,
      wb3: 50,
      wb4: 50,
      wb5: 50,
      wb6: 50,
      wb7: 50,
      workWithClients: true,
      cb1: 50,
      cb2: 50,
      cb3: 50,
      cb4: 50,
      cb5: 50,
      cb6: 50,
    });

    expect(result.valid).toBe(true);
    expect(result.domains.every((d) => d.score === 50)).toBe(true);
  });
});
