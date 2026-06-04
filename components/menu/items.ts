export type MenuItem =
  | {
      id?: string;
      name: string;
      menu?: MenuItem[];
    }
  | {
      isDivider: true;
    };

export function useMenuItems() {
  const items = computed((): MenuItem[] => [
    {
      name: 'File',
      menu: [
        { id: 'file/load-design', name: 'Load Design' },
        { id: 'file/save-design', name: 'Save Design' },
        { isDivider: true },
        { id: 'file/import', name: 'Import' },
        { id: 'file/export', name: 'Export' },
        { isDivider: true },
        { id: 'file/clear', name: 'Clear' },
      ],
    },
    {
      name: 'View',
      menu: [{ id: 'view/reset', name: 'Center' }],
    },
    {
      name: 'Levels',
      menu: [
        {
          name: 'Tutorial',
          menu: [
            { id: 'level/01 Introduction', name: '01 Introduction' },
            {
              id: 'level/02 Metal, Silicon and Vias',
              name: '02 Metal, Silicon and Vias',
            },
            { id: 'level/03 PNP Gates', name: '03 PNP Gates' },
            { id: 'level/04 NPN Gates', name: '04 NPN Gates' },
            { id: 'level/05 Propagation Delay', name: '05 Propagation Delay' },
          ],
        },
        {
          name: 'Open-Konstruktor',
          menu: [
            {
              name: '01 - 10',
              menu: [
                {
                  id: 'level/DUAL INVERTER GATE',
                  name: '01 DUAL INVERTER GATE',
                },
                { id: 'level/2-INPUT AND GATE', name: '02 2-INPUT AND GATE' },
                { id: 'level/2-INPUT NAND GATE', name: '03 2-INPUT NAND GATE' },
                { id: 'level/2-INPUT OR GATE', name: '04 2-INPUT OR GATE' },
                {
                  id: 'level/2-INPUT AND/NAND GATE',
                  name: '05 2-INPUT AND/NAND GATE',
                },
                {
                  id: 'level/2-INPUT OR/NOR GATE',
                  name: '06 2-INPUT OR/NOR GATE',
                },

                { id: 'level/', name: '07' },
                { id: 'level/', name: '08' },
                { id: 'level/', name: '09' },

                {
                  id: 'level/4-INPUT AND-OR GATE',
                  name: '10 4-INPUT AND-OR GATE',
                },
              ],
            },
            {
              name: '11 - 20',
              menu: [
                {
                  id: 'level/OM1SRL1 DUAL S-R LATCH',
                  name: '14 OM1SRL1 DUAL S-R LATCH',
                },
                {
                  id: 'level/OM1TL1 DUAL T LATCH',
                  name: '15 OM1TL1 DUAL T LATCH',
                },
                {
                  id: 'level/OM1DL1 DUAL D LATCH',
                  name: '16 OM1DL1 DUAL D LATCH',
                },
                {
                  id: 'level/OM1SRF1 DUAL S-R FLIP-FLOP',
                  name: '17 OM1SRF1 DUAL S-R FLIP-FLOP',
                },
                {
                  id: 'level/OM1TF1 DUAL T FLIP-FLOP',
                  name: '18 OM1TF1 DUAL T FLIP-FLOP',
                },
                {
                  id: 'level/OM1DF1 DUAL D FLIP-FLOP',
                  name: '19 OM1DF1 DUAL D FLIP-FLOP',
                },
              ],
            },
            {
              name: '21 - 30',
              menu: [
                {
                  id: 'level/DUAL 2-INPUT CLOCKED AND GATE',
                  name: '21 DUAL 2-INPUT CLOCKED AND GATE',
                },
                {
                  id: 'level/4-BIT PARITY CHECKER',
                  name: '22 4-BIT PARITY CHECKER',
                },
                { id: 'level/ONE-HOT DETECTOR', name: '23 ONE-HOT DETECTOR' },
                {
                  id: 'level/OM1SRAM1 SRAM CELL',
                  name: '25 OM1SRAM1 SRAM CELL',
                },
              ],
            },
            {
              name: '31 - 40',
              menu: [
                {
                  id: 'level/OC2C1 DUAL FULL COMPARATOR',
                  name: '31 OC2C1 DUAL FULL COMPARATOR',
                },
                {
                  id: 'level/OM2JL1 DUAL J-K LATCH',
                  name: '32 OM2JL1 DUAL J-K LATCH',
                },
                {
                  id: 'level/OM2JF1 DUAL J-K FLIP-FLOP',
                  name: '33 OM2JF1 DUAL J-K FLIP-FLOP',
                },
              ],
            },
            {
              name: '41 - 50',
              menu: [
                { id: 'level/OM1S1 SRAM CELL', name: '41 OM1S1 SRAM CELL' },
              ],
            },
          ],
        },
        {
          name: 'KOHCTPYKTOP',
          menu: [
            {
              name: '01 - 06',
              menu: [
                {
                  id: 'level/01 KT411I QUAD INVERTER GATE',
                  name: '01 - KT411I - QUAD INVERTER GATE',
                },
                {
                  id: 'level/02 KT221A DUAL 2-INPUT AND GATE',
                  name: '02 - KT221A - DUAL 2-INPUT AND GATE',
                },
                {
                  id: 'level/03 KT141AO 4-INPUT AND-OR GATE',
                  name: '03 - KT141AO - 4-INPUT AND-OR GATE',
                },
                {
                  id: 'level/04 KO229 POWER ON RESET GENERATOR',
                  name: '04 - KO229 - POWER ON RESET GENERATOR',
                },
                {
                  id: 'level/05 KO223 DUAL FIXED FREQUENCY OSCILLATOR',
                  name: '05 - KO223 - DUAL FIXED FREQUENCY OSCILLATOR',
                },
                {
                  id: 'level/06 KL2S1 DUAL SET-RESET LATCH',
                  name: '06 - KL2S1 - DUAL SET-RESET LATCH',
                },
              ],
            },
            {
              name: '07 - 11',
              menu: [
                {
                  id: 'level/07 KL2T1 DUAL TOGGLE LATCH',
                  name: '07 - KL2T1 - DUAL TOGGLE LATCH',
                },
                {
                  id: 'level/08 KO224X DUAL FREQUENCY OSCILLATOR',
                  name: '08 - KO224X - DUAL FREQUENCY OSCILLATOR',
                },
                {
                  id: 'level/09 KD124 2-TO-4 LINE DECODER',
                  name: '09 - KD124 - 2-TO-4 LINE DECODER',
                },
                {
                  id: 'level/10 KA180 2-BIT ADDER WITH CARRY',
                  name: '10 - KA180 - 2-BIT ADDER WITH CARRY',
                },
                {
                  id: 'level/11 KC82F DIVIDE-BY-FOUR COUNTER',
                  name: '11 - KC82F - DIVIDE-BY-FOUR COUNTER',
                },
              ],
            },
            {
              name: '12 - 16',
              menu: [
                {
                  id: 'level/12 KM141P 4-TO-1 MULTIPLEXER',
                  name: '12 - KM141P - 4-TO-1 MULTIPLEXER',
                },
                {
                  id: 'level/13 KC84C 4-BIT COUNTER WITH CLEAR',
                  name: '13 - KC84C - 4-BIT COUNTER WITH CLEAR',
                },
                {
                  id: 'level/14 KC74S 4-BIT SHIFT REGISTER S-TO-P',
                  name: '14 - KC74S - 4-BIT SHIFT REGISTER S-TO-P',
                },
                {
                  id: 'level/15 KR8S1 8-BIT ADDRESSABLE SRAM',
                  name: '15 - KR8S1 - 8-BIT ADDRESSABLE SRAM',
                },
                {
                  id: 'level/16 KA181 2-BIT LOGICAL FUNCTION UNIT',
                  name: '16 - KA181 - 2-BIT LOGICAL FUNCTION UNIT',
                },
              ],
            },
            {
              name: '17 - 19',
              menu: [
                {
                  id: 'level/17 X901 RADIO MESSAGE STREAM DECODER',
                  name: '17 - X901 - RADIO MESSAGE STREAM DECODER',
                },
                {
                  id: 'level/18 X902 GRENADE LAUNCHER AMMO COUNTER',
                  name: '18 - X902 - GRENADE LAUNCHER AMMO COUNTER',
                },
                {
                  id: 'level/19 X903 GATLING CANNON FIRE CONTROLLER',
                  name: '19 - X903 - GATLING CANNON FIRE CONTROLLER',
                },
              ],
            },
          ],
        },
        {
          name: 'Debugging',
          menu: [{ id: 'level/Very large test', name: 'Very large test' }],
        },
      ],
    },
  ]);
  return {
    items,
  };
}
