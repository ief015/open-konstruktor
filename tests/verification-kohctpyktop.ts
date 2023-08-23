import { test, describe } from "vitest";
import { assertEqual } from "@/utils/assert";
import { Network } from "@/simulation";
import FieldGraph from "@/simulation/FieldGraph";
import { kohctpyktop } from "@/circuits/kohctpyktop";


describe('01 KT411I QUAD INVERTER GATE', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['01 KT411I QUAD INVERTER GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 39, '01 grade');
    assertEqual(designScore, 0, '01 design score'); // Only need to check this once
  });

  test('passing', () => {
    const saveString = 'eNrt2UEOgyAURVHhM3ENbsG5a3H/G2lCm4YBfBRKQHoxxjYnLzWSvKK63W3radbDuKVke3DQJrds0KhHJagfZ7iqBAkSJEiQIMEuQb+cs+nhVUSie7W+T0L8dxvu35/2Q9UYoig6tzYrJaUML7VlT9Uv5pjnjKLobDp8VaIoilKV4Voxnq24AWeKURSdqipLn2YwiSiK/ktVBuNukTKJKIoOU5V1b5QkcxOd0WYrUhRFn6lt3nH/pCrje71+PvOfhaLoZW3ZSInxAmpTx6I=';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['01 KT411I QUAD INVERTER GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '01 grade');
    assertEqual(designScore, 172, '01 design score');
  });

});


describe('02 KT221A DUAL 2-INPUT AND GATE', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['02 KT221A DUAL 2-INPUT AND GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 87, '02 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmUEOgyAQRYVhwxm8gnvP4v0v0hSNSWWkBa2W8oa4ev4wIeTzCW5wvZ+MH43rSkb1QhNG0Yz27xcHIUKECBEivEFoy4SJI72JVQ1xzu5XoCKifsfpXDLXs6HNzOsfal/prqFQaC1UEnTxh0s9Sev5I7OEQqHQtumPWCW5EQqF5mfO1qxSIq/ESKFQzDB2B1IlmwcKxSq5gL9JlVglFArVU2VFF/ATXrnDuSGkSigUmvcC/uodX3zjPsUq9e84XRdKNsGSrQWFQmN3uMSRlHoA6/zGXw==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['02 KT221A DUAL 2-INPUT AND GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '02 grade');
    assertEqual(designScore, 24, '02 design score');
  });

  test('passing-2', () => {
    const saveString = 'eNrtmkEKwyAQReuMm5yhV+i+Z+n9L1JQKkkdJSSpaH0jWT0+kdC8fLD+4e/Lyy1P529H1vBBF9ahO8rfPxyCBAkSJEiwcVBqH9hy0KU171MNdU7KE6iqmtd5GkfjZPdN3NxVfc9QKHQMqmK9+/oZ2dihiZGsPe9SJRQKhc5NO1ElvREKhe7vnLOqUjNXIlIoFBnGl19RJTKEQlFlJ71xiFaJKqFQqNUqawe+3anygjPurEfTKqFQaLlVqu2OH55xX6JK+zpPkyi/Ph38tKDQuenqL4RrOzQxkjFvOmDGdA==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['02 KT221A DUAL 2-INPUT AND GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '02 grade');
    assertEqual(designScore, 35, '02 design score');
  });

});


describe('03 KT141AO 4-INPUT AND-OR GATE', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['03 KT141AO 4-INPUT AND-OR GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 47, '03 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ruVX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wGrvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiFospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['03 KT141AO 4-INPUT AND-OR GATE'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '03 grade');
    assertEqual(designScore, 144, '03 design score');
  });

});


describe('04 KO229 POWER ON RESET GENERATOR', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['04 KO229 POWER ON RESET GENERATOR'](net);
    sim.run(80);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 49, '04 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmcENwyAMRYvNJTN0hd47S/dfpAqKFCkFVEhRbPqScHp68slfJo6PeF9eYXmGeOt5ERERERERLxVDDD2iJFGo6LziWlP6Kk7XHWmck/KTqKpmz3larwuF/h1de6NENX1Fqs5c3Z8cTUfl4F+WSF9FJRQKtUA/M2lu1xIlKqFQqNkZm6iEQqGt4VC/CNfnN4/udgEnKqFQaFt0TEfFzfWcqIRCLUWlVCe0/mDx6Jr6zzl8A047QKEttL5Nnsndt9ulDbgM2IAPjsr8OU9pFij0RxdSd3Ojbhl2mB1tJtIbM77Gxg==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['04 KO229 POWER ON RESET GENERATOR'](net);
    sim.run(80);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '04 grade');
    assertEqual(designScore, 66, '04 design score');
  });

});


describe('05 KO223 DUAL FIXED FREQUENCY OSCILLATOR', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['05 KO223 DUAL FIXED FREQUENCY OSCILLATOR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 75, '05 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmkEOwiAQRdv5bHoGr+Des3j/iygkTbTC0EAxDHyaLszLyyjYz9jq7u62Pdftsbql5DAsruEoqijDTw5Fin8VpUw8fRH/iqzIiqzYS0WfAFK6sVZs5QPmamjnJD0CBRA966kf4fU+vur64Rak3pZtLHCLisUWDZ9GxR/LG8Hv6VK4n011QvO60O7JDqup4pydDo62gRUPylNJSkpKSjo37SEqwYWYloLuzC4MJUMHURltwxmkk4Qh6A7sIvfdQEUysKtk7MwTlfqlBLrGXVt9Y/9dJaNyWgrQndgFDCVD8wfkx60D1/acpLYp6I7sIkfVbjadG22ecV8SlfGznu67x/EfAezBxvkBXnOXTOjadqXiTqaSDK0TKTJeEfjHpA==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['05 KO223 DUAL FIXED FREQUENCY OSCILLATOR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '05 grade');
    assertEqual(designScore, 142, '05 design score');
  });

});


describe('06 KL2S1 DUAL SET-RESET LATCH', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['06 KL2S1 DUAL SET-RESET LATCH'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 46, '06 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmk0OgyAYRMVh4xl6he57lt7/Im2+mNQ/UKEkoE/CxudEQWdAxT/9Y3i74eV8l1IuIHRpwt7KaaGzcv1eRYgQIUKEtxRmDHOJA2vGUH6x22HTuT68GZW0WfPpl1vVeDrNzjvS37aktk+b1xxvERQK/Rv1XQibRX2n1RHHDB4Jh5KhFGryobSEQqHQe9MmojI6dRQ3EQqtmCrD3UTlyTBUmPIODoXWTJXh7pqCtI2o5MGDQplVEpV7XR3rTBGkUGjNs0qlu7u5qCz+m3s9wkxozys2FNokjft33/sl/oAXjsrtmk8PfutYrCaYLkbgsYRCq43KXYeG3V1ZIn0A7W/Grw==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['06 KL2S1 DUAL SET-RESET LATCH'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '06 grade');
    assertEqual(designScore, 58, '06 design score');
  });

});


describe('07 KL2T1 DUAL TOGGLE LATCH', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['07 KL2T1 DUAL TOGGLE LATCH'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 46, '07 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmk0SgjAMhSWPDWfwCu49i/e/iA7KomOa1rRBfh7Ixs9HHKb9DNTxNl6nxzDdh/Hi2XcdFH9wWLXiMO/OilJTtWvF448cBhlkkEFXUHzBSiXrFSt+BDpXdF+ctSsebsjN7Zzkt5kCUI92+uLza9mQ1H1TmNTIAkb2w5dNo5mrkZ5OpUJq0s+YNWj5E7yiTmqPa2XYJzQ3Y9I3lZkq5jwWXzbSTLkrWaXMv1LKiZT0nALf1HfevioDNcv+kZS0Slk4hu72rsowoaFhAIC9LumJbsBLZ4aVbRHpbiS8fVXGUXaVpFRlB2XFUXaVHXtOs6ssiBT+LKch6aEeVRWEBn+2SeB7U2X0WrdJxZsVcxW9eHtOVZKe6QYcdar8fY3bnt1w0Zg17i6q1I92GtlVqn1hqsqvf0BQlaQUqSbS3EwBEPlYYDtGegL0NccR';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['07 KL2T1 DUAL TOGGLE LATCH'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '07 grade');
    assertEqual(designScore, 94, '07 design score');
  });

  test('passing-2', () => {
    const saveString = 'eNrtWm2WgyAMrIx/eoa9wv7fs+z9L7J+sBUUAgZ5ik599bVOAhiYSSrtv/uv92/3/un6l+a4hWO319HYY7djNxxmOu92NFrHV3qgseDMd3n/BUBHOtKRjpd3VAmyOgUUJB1lmlMnVnUqv+HKmco5E39NKIDguxwd1ifGcdhrdrkOl9zu7aXh5BptzKa+xtYlk/m73MzcknFNzMZisJn7s6Zr9L+vT+NR3LHImIv9qO2hStvXROeIqgNyLO5NcO4AG4I9GqxhhxxYQuG5Y8HdyI0fFj6HG4D5aIJgsAxibVBR16JrNktwT0choBB8kWgZ9xYeokQPQmuyDG1EowGpxGmjAslC9DEoHsbuVqUSQs6CMIlOmV8hG4JUIvqYuhFV6kaZoTK7L1VzXl8qQ7H2Qq2WWZOcJqJEHyOVakGTOSjzlz/AD0SL6sYCXwopUUplbZalfFuTyrIdJXjBWm86wyv9A6jxdtKEZywQbxniJIJkIcqNGy2PohyU+ZvkflQ36uxxHyKV4Xc5mlX8R28KQPYCCGe01GMB/y9FJBrRG6Px1Z5iCtQMTT4FxTmKtH39Ad5Nx8U=';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['07 KL2T1 DUAL TOGGLE LATCH'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '07 grade');
    assertEqual(designScore, 114, '07 design score');
  });

});


describe('08 KO224X DUAL FREQUENCY OSCILLATOR', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['08 KO224X DUAL FREQUENCY OSCILLATOR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 50, '08 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtWkFigyAQlB0veUO/0Hvf0v9/pJVoiCmMZpGKsBhPw+zCAsOCGT/Hj9u3u325cdA8lyaKjuj8o/LodB7FPyrioPV4AaLsD8wz8T5+KqLMXs3jsR7ln4lu7qcyOIN5NI+te3x7mwseRSsdb25z7kFxHaQre4k+nZN08SiA6JuP+oKnsvI7Y/MwRxo2VZBAekEnCvyPwalOSzl06g3DgfUoxSuFsKRqIEL+Y2G7GdSAEFyEG0Bs8Hz1EKffSLEWwOOpUIVmprqyMkM7Ch4oiLE1bNDJlVzb94nygNeju0wuXyOhLYU1LdrtXWJrqKGGGto3Wr9U4iTuGSja48Ki0ToXZbiobIXWIJU01CTJ3yGGqE8qoRaWHFEqyOWXPxs3HdJaNPrj0mO4eoUiR4T7lMo8ma0OjV/OLtNDKFopF9yyQCmkoNuKcavhQssFrnTuq/4ADpzDLXXEBs/BcvK3GrngGQvQVTSa5GpXGVK77J6ZU6tU5n8lDwYRyQzBjqscFSiPuqehrd1WbW9Y+gzcuBfgblxzQYeC6kaZb9yHSGX8zUeXeL3+I+AA2bki2pxUoreNw7jHzRyiDKUVKVJ+ACaFyN4=';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['08 KO224X DUAL FREQUENCY OSCILLATOR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '08 grade');
    assertEqual(designScore, 228, '08 design score');
  });

});


describe('09 KD124 2-TO-4 LINE DECODER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['09 KD124 2-TO-4 LINE DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 80, '09 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmV0WgiAQhWMuL66hLfTeWtr/RjpaJsIABpKmF44vfXP5i+4ZG3uz1+5huruxl5JOIYUUUkghhacUyrsXCI01NTPKt0Lj9K8PR8pONTknr1wT4ZDOSbwNFID61NPhprynGj71Zp7zcGV9wL9jewGcbUYjfr8+t0eCpm8oxlNTOFTb/2LxKeh0R8rHBtRf2UglSX2xQpEaWaGjCv0Vd/iI+x3j0wL8Cum7F9HatqJ2uchPSUlJD0DB0yintEpS0gPRdFqaGRkVVJppaZWkpKTr540oNVJ4YiUjRaEZemJaJSkp6bZWmTZD2WfOSaskJSXdlVVmXt6RHDle+cn/LRCvCx3KKtepKKH81YCUlHQBzRS6a8rgkimDi1oGn42uUYQu7VHMvaNhjXsVq9SfenqmBJ6UtDXFzlYV2G+gVSK0XBcbONK8PQHB78ek';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['09 KD124 2-TO-4 LINE DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '09 grade');
    assertEqual(designScore, 142, '09 design score');
  });

  test('passing-2', () => {
    const saveString = 'eNrtmUESgyAMRYW48Qy9Qvc9S+9/kVYUxQxELVYifhlHpo9IGsMHpX22j+5tupdpm18KDGF4tKFh142GlpW6o2r2Gq6ER2MCNL8kwFDb7aphpd7Msfsfh5HCA5WDIQwVGbrlnE0fjhJR9MynXz70Q3N17jeTts0K9iWj997cdZRuYJN8PEYXSOy+GKUjaZh7qTb+iNJpQuobDnehqdEylf39S9Dhb8SoBQ1/DJ42p8tciFHf4iSpSknkJg0FBQUFvTeFVJahiSWsAp+pUDT0eWUv6hUopLIeMSQ+1HQMcO7WSWLovg4IssPcUhWrqYKxAKkExboR60ZkO6QSASlAF5+xFck7c+u0aMi2zC1VsSJCPkMqJ3O1m99Xp3fYDRdpoJUCtYX3uIWhhD3uVUohjlJazpixHXD2oeM/e9yHSGX8zKf3m7P4cvLeMziiUT/ly+/UW4N0Z/5OUUCRPmbMyDY=';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['09 KD124 2-TO-4 LINE DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '09 grade');
    assertEqual(designScore, 222, '09 design score');
  });

  test('passing-3', () => {
    const saveString = 'eNrtmU12wjAMhGONN5yhV+i+Z+n9L1IaCMR/SipH6QOP/cKCzyKKkMd2FD/jx+U7XL5CnCydhu9tGGyGkvQzDHc4ywT4H0OxGYa5n+eqWGbHs58XVbEZbjjr4KpYNSfoznJa0ZCGTcN5OyftNlMA1aufznxpxX3vbUZxcsRipteHaVEpnop0Ha2KrUq1OIt63zu9pbxlQJYIx9EliapUbPSZ6wa8BEDnt+v6iWR2VcfEqT1oLUWiDVuLRGPEKomSEZ7i1RLNXapKSkpKOjalVJopdFswVtk3cPplePkMr2gwNyiVA4nh7yFMOahLjkeYLKoYtg/qPWKILhHGpqAZfcaOvAJnGaVyEKnkzoH7Rv77lEqGS6ebVSutaDFiJOEipI5xVgta3T4DzI33k8rOcvhjmdXL4fJaVFgp/1M9GyIdtXCdwkplk3ZVwdWF4+Aa+YtSlHMto0hf3jjWuA+RyvrVTx/TJJclrmjcczJWA9Dy+FW8JElXWXdFarQfStHIaQ==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['09 KD124 2-TO-4 LINE DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 98, '09 grade');
    assertEqual(designScore, 231, '09 design score');
  });

});


describe('10 KA180 2-BIT ADDER WITH CARRY', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['10 KA180 2-BIT ADDER WITH CARRY'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 60, '10 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtWl2agyAMlExfeoa9wr7vWfb+F9lVVECSKCCfto1+9m+MCRDHgfTx/fh6/rrnj3sMNfvbGLrXMRzM0Az7GlKdoZv2YfPd7Rm6bO/fRqoz5AI81MbRI228khzF1iNlfeqOdQ4lfEOyT7lXXRQD41kzDDG4Go/bth9IgOV0V+Zx0BNQTznfq24+Cj1SjUclg43lPt1wknMkbxMKgD3a0fEjJkf+HYnfCV02Fp2/r2cIaNYiQ89Ek21Mqw3uf/h/m0dRO8Hn5ZGrZFGscJ4MFMNxOxbruX2TdQaHMwTU/za/IEN9sEgCK0XHD4ptLeovTCTYpkOe2XI9vaLxVbqjHSlKpMZD3Gmooe+G4owroykq9GovWNo5JeYPRo0qDW1FcY1fsHd/oS0aosJFo/CKMRtVWgIYGSJMkXLFAuJFXCEZMmhwB1YpAcoqQja/EzQnFA2G1Den33Z0I7R8Rq2alSbgTINNc74hVRoZfrRuLFeVCEQqT8Ch5hUEEt6h2cgrNJqFjEIlNKhTbHiuNDK0CbihN0ODfFOqQOf71atPO4o0lG1Q/YAGVzE61iLfJZVrlWmtqYxId2wtn1upsq3oHR6xbCmTf0xvbwduwmKl6RuiwhjhdHStchNLWYg0lkJoYo2bEX95vTiGs0q0jiK+zKkVcOn2Z9ZCyirg4qLBa1XAO1Mlf7SjkSYRpn6sLGHWZ+xZeR0a/t510SgAhYp0t0W6XygZy6bkXTIWLbY3UqQ9GUnY/gAe0cj/';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['10 KA180 2-BIT ADDER WITH CARRY'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '10 grade');
    assertEqual(designScore, 320, '10 design score');
  });

});


describe('11 KC82F DIVIDE-BY-FOUR COUNTER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['11 KC82F DIVIDE-BY-FOUR COUNTER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 65, '11 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmVGOwjAMRB1PfjgDV9h/zsL9L7JRQKClxGntLSXRJKqQ+pgkxmRwSf7J59M1nS4pi6cPKkyP/ryzacaU9d43C1MVJ49QvUKxF9oSShWKTygR4denQ7zpEG86xJuOmTcyhRRSSCGFT2Et57TdKgXw9orTwrPUl3rvdeLSKl5Q/bPqMqJBi/oWbOMN9uBFZs/do2jSA6NSOyhVUtIR6J7W1LLEVZ75BRTW9je06IwMRkRKSqpzWCWmSwT4tSQlpVVuoehXWdDQE+thFdp8EZGS0iqPXBhMY6m+0qbQDoU1LzqrilBnRGpG1LNZmiEp6ZxV5eIcYmkOVpWFTpUVqND2+zTmi4iUlFYZPuxe8e8coP4H0ggNnAjPFxEp6Rh0nzPuf7HK91ecrtrgCP06dCo0/8i2GY4YESnpGPQDjvTafgFIrMdI';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['11 KC82F DIVIDE-BY-FOUR COUNTER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '11 grade');
    assertEqual(designScore, 117, '11 design score');
  });

});


describe('12 KM141P 4-TO-1 MULTIPLEXER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['12 KM141P 4-TO-1 MULTIPLEXER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 67, '12 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtml2SgyAQhHXal5whV9j3Pcve/yKJAvFvaBWNW5YNsWLVNw0atJ2AzU/zfPzVj9+6qUqqhBJKKKGEEt5UaO9aIKwHdaPQYr87eqy392ixbu4xfNvpPdY3vVa7dM7ypaMA3G0/DQWhtHujfsc4RLjUOWbRMW2qhMPe2dxmuL3+aECKKG/hfwKaqh+FdKO5IbGRhZh5dQf90LB5nBNl7Yf9SN0p5K6EdIZGb3mfthtre1iG9H2YcXDwGSScZnOeva7yX1FRUdGdFNc+I1mlqOhtaEoui7S2oAXV8mPOpZ1rtLJKUVHRAjOk2pFXbjVDkhm27SKfN4KbIfItI1ZZpaio6ElWCZr7gVolaL9BC9Zv1kiBS/zOskpR0btQTJYSN2vB8lVuwsa1oCaMq1jlAQvnnwdabml88ujS0rioaAE1UJq3rAgXKFnnzmuXZiN7LSYUM//45hr3IVbpb/tpP0fC51jI6wjKHERF19Klv+eFLVOL5tpk7/0dPn430Z0j/bYjOeUFWYrItA==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['12 KM141P 4-TO-1 MULTIPLEXER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '12 grade');
    assertEqual(designScore, 223, '12 design score');
  });

  test('passing-2', () => {
    const saveString = 'eNrtml2WgyAMhSXXl65httD3WcvsfyOjUrRgEiyKRUSPetovkV+vAeyf/c/jzzx+Td+l7M3xDEcTuSqOpF6PT7G1Y25H05t0R3MVx4Kbw4h71HHj01iCY2IZu3RH7gZNAYpx/Lgdwwc64d1B855QRlq736Idp3CO5G2iANhjP7V8OL8dS7oT3kNhTdzh074b/gpO3N2XHLLU/rgSHUpqt75jOTBXVlifb5tM+ZRtYlAaUqdTxxFvPZTJ9mivJWebFWZsyOXeK99CR3cS+VipjhNAPF/OrMmUK7isghiTpbsreKxrmx3RwOVlzz0iBrbQL0vOAEE/DDjZdgXJFrTFYOpW7o/sgiYJ6SalrZOqKn272qiOss17CG31fEt6Y6lstNFGS6EoPlypWiojcSOHq485/aH52hfp6ULzRZ64Mbn191A2Zc/3VR1CRIoq5Q6RCFwVQ/YZJMaoSeUXpPKeA3BdKqHL3dli+K0h9jEDcLS48YO4sfiJjjZX2eYqr0q5NapThFRNd8bE0tmivqhSLO+W1wqzzhhyXEAqdy6RU8YlcpWqQ2xEHkO66PJ4hGrl3TbUheibujYeWTnPNy5AcPXvLK2FLx9lsJQwL/kTT6k+6mYcUikfcwYUBylSVqnkj/1UUqxS4sbYzN4FqR/SrKIdoSa5QCqkmfK8UvFj+ob7KkqNZ+T5xhbb+y8dnPq1QE5FErZ/UvTJmA==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['12 KM141P 4-TO-1 MULTIPLEXER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '12 grade');
    assertEqual(designScore, 346, '12 design score');
  });

});


describe('13 KC84C 4-BIT COUNTER WITH CLEAR', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['13 KC84C 4-BIT COUNTER WITH CLEAR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 56);
  });

  test('passing', () => {
    const saveString = 'eNrtWVGWgyAMlEx/eoa9wv7vWfb+F9kWlQZNgqCu2kZe92MnAxnAJMjt+/Z1/w33n3DrWtpFibSIQhIxiG0BURrhWGKoI1JqoXbEEOmhhUitxG5wtGFyKClumNV+ihYTX/vHl8OXw5fDWo6KSJ4vR1UK4MtRlXT4clQSu9zRmjRHdflRzV4WMahNIYYFrfu0quOfiLGcI/2JKADxtx594JT+3jpw30DJiG1b5AYRY4bMOnaomQz/XoA/ndVxRC0cR/4Q1O576weo4s8OcvwlLbd6jsR6SHAPRQ6mQ7B5FG2mm6UfJbebq5XHYnINg9FXs4eZWJppVfCk84X3s5nNRlKJgkqUVKKkEs0qCZZGEeXyuIGwYWFKU+Fhu6IwMSI+xAEFB8cpxzHDqYSzt20MJLLFnpFPi7iLQvJxKM7iFQwUBheFnuGKXNEHKbowevJQeQ4Up/UZrsgVOfoZoRLyHsm4ODSDx/pc9xnjEWGf7I/WqsMVuaKNa06ob2juXX6Yxbx/D5Xbh0rM12IvFDoa96WGjk1FYY2Lks9oVARXdBZF6m7HJFSCxGgoh7sC2hxIvaq86LdK9ln7KK+wKoOv4C6ohJV6hk+XK3JFGynK3sVpVZm/qryqnD7vHCo3u0tPaVg+YsMOWXuisL8amRtvDWpnf+PAghIK67AzKILpcxsKFA9ZMBXBVARTEUyfG1HYXCLj2ttGQcatduHOew2KNi6MuQJ/h/Wb7tlub0P3uePeJFTKv/XoaXKHFbJg1LpAsWc7+9s+61mYjX05RfRuiui9FJ0fPSAi/QFOLss1';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['13 KC84C 4-BIT COUNTER WITH CLEAR'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 98, '13 grade');
    assertEqual(designScore, 466, '13 design score');
  });

});


describe('14 KC74S 4-BIT SHIFT REGISTER S-TO-P', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['14 KC74S 4-BIT SHIFT REGISTER S-TO-P'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 55, '14 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtmltywyAMRY2uf7KGbqH/XUv3v5G2fg+giwGT+iF7nMnkIHQtIo1i0n/2H69v9/pyfVdy3spQhrPI0KU8OvXMkOpK79EMzZBPwQydnhvMcDaRXI9u8pqdHWLBseBYcI4NTlcanGc1D+cxHNo50Y+BAohe9fSX993oCcPxJ0pk/GwesarB+J7g9dY2Q4TPIJEZZJqCDFncqGO2MQxUJLBciQ5LF6MjgGKLaYioFDpdDjZzkSpQVahQhRpVoKpQoQo1qiBJv0FB8VQBkWTYIo0vzBvQsmBphXJXJTVq1KjRZ9NTlUqU28KW+C2UxBnMFk3XyFRdXZWVykyKvEKKY8qs0d2pBD3OHsy0NVV3V2Wl8sgkRdEXAHRmo5mUxJl1HaBdB2Cqrq3qCcXwLqUyYrt9bmyd4TsoiTNSadhujUzV1VXdplRWboHHH3ao298arelIjTalmF8JFVDKbalfYTvduipQVaCqkPYrbKebqAJVBaoKSb/CdrqZKr/lDKmoNFjhyCrE6UpwYEVqWirjVz3d5iDseePJqZcRe5Ml9vvN72fYzPrfUbgqaaZKalRJM1VSo0qaqQoXMdCsx/n/KpJ3/ABKzMkh';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['14 KC74S 4-BIT SHIFT REGISTER S-TO-P'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '14 grade');
    assertEqual(designScore, 312, '14 design score');
  });

});


describe('15 KR8S1 8-BIT ADDRESSABLE SRAM', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['15 KR8S1 8-BIT ADDRESSABLE SRAM'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 84, '15 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['15 KR8S1 8-BIT ADDRESSABLE SRAM'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '15 grade');
    assertEqual(designScore, 1009, '15 design score');
  });

});


describe('16 KA181 2-BIT LOGICAL FUNCTION UNIT', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['16 KA181 2-BIT LOGICAL FUNCTION UNIT'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 55, '16 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtWduBnDAMBA0/V0NayH9qSf+NBPBLkiXz2r0lnOEWDoaxDBaDZE2/p19ff8evP+M0nFn/M+KxVVk8TA3EnVbmldZV3OM+WzRvqdzjMJUO832ywFdBDId6lcQxXiOe6sC6QXk/xHOjOleNI6n94DS2ywE48ZDnJAIddTl6yNvRiZ34DOKYVU9sW8SipnpL08b3kc5YHE2LJL8dtrWibolSNL9JLBcKyn6LlaYeGY5TRPN7uc9zDPKPeDvWcI78ZUUBmL+r6LydhuVgGmj+n5bT634+G28L60ECwxXrL1+Q2lvg2DoVC2GJbMr2yUGJ9W62SxBLgCl1HqU/qXsCDWfCUnMZGrvvofGhmCjoe9E4Ut9v+DAK+OgyFDYaB9pAM6RQ6SEcNaCMooE6UED5yynbIY1CXClRacBFybaLZN1ABVGjEhIoNLGgsqvpjcBbtamlibtE8zlo64EgckHYaJmrIfu3bhnsugoVrZjoU0eho6/zZ5zjBic30ez/Sgw3W+YvzgNH4YdJpY8q91CBY39JO3obFG/jXmgZePoofFQqlRRBRnciU5WB2IKCRKYLHTdCjn6K4Y0smo92aBkyQQtZNDUycC/mrFEn6DwRkXbpeDDaTsD5QUPu6jRZeqaOG5FeKjPmzAm4E3OKfh2NOcH+rGelEvAeVV5GsZFiWxOOeZaLiSHKVGKaLTHFME11OIIGJsY9Ae/oS6SSsBdtt2zIXeKaYpjmDHsC/omo0lwK14XX2M9g5dINGWQWkSpBY2pYJuejeMJIwEHCazYiQ7hiiC6VHb2U6tZlnSa3ODPgtgzbn7HZ8pWpKv6WmlGlV8a6mVReqyiBVShZWhsTcOREGlbRFywH1lVuVgOnXAOnVpU7y6z2t2zIGkTSRe5a0rwSOG0UudvcW9eab4kS+RXwlJDWaPYgewSJqgp4nTvALAjKCrhNPFqawX4hNerUDbRwT1XAfTSGqmYFnEceMsVmowpdTXhPjfslUmn/rqP3St5Z3KiiVcWF8ZX1Wm7GnD1Sei3aijp8rxPZiplxaLt1PlN7jvAeK0tqZVjN+xXXHXxWde5mPokTowDXn+Fzy/RVnbuJ2a2PK9I/4uPMKQ==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['16 KA181 2-BIT LOGICAL FUNCTION UNIT'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 100, '16 grade');
    assertEqual(designScore, 688, '16 design score');
  });

});


describe('17 X901 RADIO MESSAGE STREAM DECODER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['17 X901 RADIO MESSAGE STREAM DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 49, '17 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtWmF6gyAM1bz+6Rl2hf3fWXb/i6wCAgESAau1K/IV3d4LPIKkYez2ffu6/873n/k29ZRh+MaG5MrcZrgaLYXqDWdeyoZUfGKl1jA2UpxT6rHROdTrHGpzztTrnKnXOdN+5+x+c+ZW5wTDRueUDBPnzBtFXI/dhtb15Or8aaNHEp42QwdtrpARV4dhqyH1Gc69hlO/4dtOh0nnSL4MCqD42Y8afBFi68d9+d3jtjz7/h8sNzNYha88KtOImklpj+bnjGXUxy1FFGdhWMtlWQEIvNCUY8X2KW3phxIa2GUYlDB8Q2ZYpiHbqcxbBcT6BaI8ghIvGgJFNDaSaBAZJ3IOG4VEjBvOiORvjkYqzc2oMITQWDoGww/VQz2yJUW+SmHKYfaCIrnCCxSasJ+1yno4EaZ9qB2Vgd2MgFjtVssWh3RK5kOBRfDLyrFCTPL1GtSogkeMd2i4lcJ81ffAQMm+k0PVe6uqRnkgGmvhHBSX1jxCJZ+pzinGRr8Yqs5QRVLC2mybB8oR0D4cHaEyXqRiLmT3vyijcOsxRrPVVrZFKezgMFXZF3iDqkTa+ar8vrNmfqFnhnzvntuWIuXIOQ/OG3HtnHOESr6IlVwIaMiF9JykImOBqgqqKqgZWlW/B/kKat4ItV+oAQ1NWSU4PoLhJbbYYwP+JqESWxmLFBzW0woZhRg6rO3HqMIOVcRVIT2344FURTcyUiPRVyPcnYTiH2zA954ogeJTPKh/F3oVSsQP7hNbxMs/TWjY2W9h/5wd+uooOMpUcTRVldkyVQU0z8F0FIoqjxZVQfIVy+20A/LCDIoosi12eoLMqwwVs50nn1x/GErPavmQM+6nhMryZz/qg9DrtwbQbaGf6rZMRG+2c6yqSNrVVMUTVKcKe94NrP8dRcwZI/e7TlZ5ZEQSrj8TzcwW';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['17 X901 RADIO MESSAGE STREAM DECODER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 98, '17 grade');
    assertEqual(designScore, 461, '17 design score');
  });

});


describe('18 X902 GRENADE LAUNCHER AMMO COUNTER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['18 X902 GRENADE LAUNCHER AMMO COUNTER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 60, '18 grade');
  });

  test('passing', () => {
    const saveString = 'eNrtWWt6ozAMjDX90zPsFfb/nmXvf5EN+CXrYQwODWwLX9OEGckayzYyfPz++PX5N3z+CR+PI+dNDWmTTp5hYOcuw3ruMnw0bR82rAGHfYZW2IOhhtU8HDGko4aym3b0Kt0vHbQaHUgHJWe70zFsSCIdw6FWAx7DYIvyCvnzsYYk00F+Ovjsv1U6gpGOkJK0uhqdHdIwjM6Obuf00xHG0vEw0kEjnfNQ6RiajzkGagzDuGGbDho17N7BtgyDeW6G6p+mYRg5997K6VgNwO7V36LOWcs58o8VBWD+zaNP/Jmo5d/y+bwawwKWTyokihfRsvLJeCtKiUVdEtYoqKCaEIOPFAtPHpiLSMhNIlF4KMzN88fCif74ofCofDXPviCbSm4qLQHFWaYhe4sqnp+MQijEKE5SUvcX7Q1eoskETYkuEsnUnUKrfpjyxUA1tZCIVAcVYtbLWmo9VUJSXbo9MjJcnBRVlZHHbZJdI+YUaoJoZSecanvRh+TU0eqS8jxB+hqnmCTUNBsUkoqZ00QpGSiprmOcOSIpOkdcCWUGsGGqCcs1n5B7zmDEbKbeRcshwUHlUJlXPiXPkkoo3cZmAcWJcPpS6i3hQ2v8+1BcICp0UHRsseEZ11WEriLsV4SrK8J+W9rojTePOlxt1N0dvfhS+XYUP4q+EN217NSS5H/JkVCEnzloDI/vu1TCni7XqElQBq9GEeGjdeO5NeesIjiVYTOHBdqtOdGr0CC/NUsHbEVIPicUUVdRbTNt/nxb1Ccj/cWfxwqJKkWYGHU4oeZs8tQbz01f6Z0hji2GbAP+s1SqJKppolOMSbSdxApFBwVtoOhFhTcqAnqKbLQsXegpQjdmz7NYPPjCUhTh5Yowpgj7FaGriPWm3RspbntBK+POQ0EuevUNOC4Z1T2eVZbn/y461a6ylzXYTN04YXu2Ihx7sgdWWp7wrBLYoSgn/yWKsGXrP/bPMcznSCrCzKjrKYKrd2Onw1/oqXab9328qlTHwdGOG2zAZ1/Oj2zf3AGA7vDYRuF2CNpdkOnZW+5gjFoHhdx0gGfeQzu2YhcFR5HjGTTQLhko5MBVKHdseDZsy46zEV1QtG2Ld+G1RXTQZt/IUR2URtFFHVuovmavxPmeXdqSUOSg5KE0gLI+9W2xZUv61Xuzh5IxmzssC4WJ8p8nvuN+yVJp/82j7sMdNtH8qnJIsrQ37pWHnijquDp3YX0nBWYU4f2KaI8i+PuCxq2wxZmKVK3jKkK3nmnRRpFud1wRzKpyWJFbc95xA85Vf/mKlI5/Va7Nnw==';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['18 X902 GRENADE LAUNCHER AMMO COUNTER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '18 grade');
    assertEqual(designScore, 653, '18 design score');
  });

});


describe('19 X903 GATLING CANNON FIRE CONTROLLER', () => {

  test('empty', () => {
    const field = new FieldGraph();
    const net = Network.from(field);
    const sim = kohctpyktop['19 X903 GATLING CANNON FIRE CONTROLLER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    assertEqual(grade, 57, '19 grade');
  });

  test('passing',() => {
    const saveString = 'eNrtWlt2rCAQVGp+soZsIf93LXf/G0nkZQP9ENEcdaJjHFMUNA0UDc7r6/X58X/++De/pj3n7YguXu3pmpMQ+TPRZsvUJUl9rVkYxIlcsvkNsa2NaKjlVfegDnAd4txHXFuym5i6Wjdx0kuzS5x+pcR5b4nzeImuhzjndkwZbCY6QqTPJrF0ziw5iye6iuhs4pRNnIVnowPQfuq4kcJ5lX6bpSGmeZV7fmuvlka3E98moqp0EpGdhXsEWZ3KHz/p+HDOyYdHAbDXMOq/hGP5t1s+P9dr8jAynDjhMcIBQMzQHwuymr2k97m+Jo+F05VJYo5Lkp/LSuQTtg4ixxloskjGw18B99UH8XVFx9ofnJwETqs8ggP1BMlGUk6VQ6ijiDsFD22oZeDR0hEZBTl4biif4gSOTRPvofiSjfVewznTBPsEFI9NH+6ppajtAYOcoKh8k6CtQJMAxZ1LQOsg5OArJmcRe7kfh9EP4dP4Ermj1c6MYxSpP9VJQs6kQdK4OlfpFIXdJMFXRZE0VuPCyBn3qe8h6L3qi9GcIaDg8FL2arzIucE7uHtrdEebn4NeSSpRoWAHCjv88daNeBSKp3HhtqC4URvd0WYLBTP2/6RyiximMBu0X4B1Zgwrwbo6R5zQmwlPizkxMAxxiihpXAxxjbgREKdRxP4BOHup/lvxmxE3JlsvZfOGXqeKIepRKPZY/EklExrWS2yuw2NVSqZcCEPx+QtwsUZoZgZup03kquhuLlQujHJbuJQdQJAd5F13dks0z8AEb60Ci1Z7lsqmEHibqzmAtxlXsfmIuPEOq8ILLcCL3fr4toh5zUHFMOsoemOSNes32qtknFlEhgML4bO4GCmXUeFSdpwklZxy9HDZDaUD9iova3M9VHu2UOpuaSrDhaVy6H0TE2iDiyrBNzFtZwhLbKh7lRiZs3ArVBcWC4WZM07gmgt/kyvu3SWpFMRBW67a0qFEWSMRmsodsdlA0U49fTlD9ZWCAmK5RDCOewN+slTy1zAKMfqr9ypZuSMtwP92ZNvS4DlxI4y48YgXClfi0p/2tHEU0qDZI7Omn+mdkWgnSbQeN0LejHJ5I6rYkOr9LQHkCHyfzRt9tXMdxFt1miLJxzfoXMro';
    const field = FieldGraph.from(saveString);
    const net = Network.from(field);
    const sim = kohctpyktop['19 X903 GATLING CANNON FIRE CONTROLLER'](net);
    sim.run(280);
    const verification = sim.verify();
    const grade = verification.gradePercent;
    const designScore = field.getDesignScore();
    assertEqual(grade, 99, '19 grade');
    assertEqual(designScore, 424, '19 design score');
  } );

});
