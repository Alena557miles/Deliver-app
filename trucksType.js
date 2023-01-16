const SPRINTER = {
  name: 'SPRINTER',
  width: 300,
  length: 250,
  height: 170,
  capacity: 1700,
};
const SMALL_STRAIGHT = {
  name: 'SMALL STRAIGHT',
  width: 500,
  length: 250,
  height: 170,
  capacity: 2500,
};

const LARGE_STRAIGHT = {
  name: 'LARGE STRAIGHT',
  width: 700,
  length: 350,
  height: 200,
  capacity: 4000,
};

// eslint-disable-next-line consistent-return
function getType(type) {
  // eslint-disable-next-line default-case
  switch (type) {
    case 'SPRINTER':
      return SPRINTER;
    case 'SMALL STRAIGHT':
      return SMALL_STRAIGHT;
    case 'LARGE STRAIGHT':
      return LARGE_STRAIGHT;
  }
}
module.exports = {
  SPRINTER, SMALL_STRAIGHT, LARGE_STRAIGHT, getType,
};
