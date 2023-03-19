beforeEach(() => {
	// Set default styles
	document.head.innerHTML = `
    <style>
    body {
      padding: 0;
      margin: 0;
      overflow: auto;
    }
    #trigger {
      display: inline-block;
      margin: auto;
      width: 300px;
      height: 700px;
      margin: 1000px;
      margin-top: 100px;
      overflow: auto;
      background-color: #f1f1f1;
    }
    .bg-red {
      background-color: rgb(66, 0, 0) !important;
    }
    .bg-blue {
      background-color: rgb(43, 61, 226) !important;
    }
    .of-visible {
      overflow: scroll !important;
    }
    .dir-x {
      width: 400px;
      height: 300px;
      margin-left: 1500px;
    }
    #child {
      display: inline-block;
      width: 200px;
      height: 50px;
      background-color: rgb(136, 136, 136);
      color: white;
    }
    .with-scroll-x {
      margin-right: 1000px;
      margin-left: 1000px;
    }
    .with-scroll-y {
      margin-top: 2000px;
      margin-bottom: 250px;
    }
    .m-t {
      margin-top: 500px;
    }
    .h-50 {
      height: 50px;
    }
    .h-100 {
      height: 100px;
    }
    .h-300 {
      height: 300px;
    }
    .h-400 {
      height: 400px;
    }
    .w-50 {
      width: 50px;
    }
    .w-100 {
      width: 100px;
    }
    .w-500 {
      width: 500px;
    }
    
   </style>
  `;

	// Dom elements
	document.body.innerHTML = `
    <div id="trigger">
      <div id="child" class="with-scroll-x"></div>
    </div>
  `;

	// Objects
	// global.testObject = {
	// 	plainValue: 10,
	// 	valueWithUnit: '10px',
	// 	multiplePLainValues: '16 32 64 128',
	// 	multipleValuesWithUnits: '16px 32em 64% 128ch'
	// };

	// global.anOtherTestObject = {
	// 	plainValue: 20
	// };
});

export {};
