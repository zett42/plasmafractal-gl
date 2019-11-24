import Vue from 'vue';

const requireComponent = require.context(
  // The relative path of the components folder
  './components',
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match component filenames
  /z42opt.*\.vue$/
);

requireComponent.keys().forEach( fileName => {
  // Get component config
  const componentConfig = requireComponent( fileName );

  // Gets the file name regardless of folder depth
  const componentName = fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '');

  // Register component globally
  Vue.component(
    componentName,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig
  );
});