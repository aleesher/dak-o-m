import * as path from 'path';
import * as fs from 'fs';

export interface ImportHelperProps {
  importPath: string;
  listsDir: string;
  nodesDir: string;
  relationsDir: string;
}

const DEFAULT_IMPORT_PATH = path.join(__dirname, "../../data/import");

const getDefaultProps = (importPath = DEFAULT_IMPORT_PATH): ImportHelperProps => ({
  importPath: path.join(importPath),
  listsDir: path.join(importPath, 'lists'),
  nodesDir: path.join(importPath, 'nodes'),
  relationsDir: path.join(importPath, 'relations'),
});

export class ImportHelper {
  props: ImportHelperProps;

  constructor(importPath?: string, initialProps?: ImportHelperProps) {
    this.props = {
      ...getDefaultProps(importPath),
      ...initialProps
    }
  }

  public writeNodes = (values: any[]) => {
    const nodes = {
      valueType: "nodes",
      values
    }
    this.writeDataToFile(this.props.nodesDir, JSON.stringify(nodes))
  }

  public writeRelations = (values: any[]) => {
    const nodes = {
      valueType: "relations",
      values
    }
    this.writeDataToFile(this.props.relationsDir, JSON.stringify(nodes))
  }

  public ensurePath = (dir: string) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
  }

  public writeDataToFile = (dir: string, data: string): boolean => {
    this.ensurePath(dir);

    const files = fs.readdirSync(dir);

    const fileName = `${files.length + 1}.json`.padStart(10, '0');

    const filePath = path.join(dir, fileName);

    try {
      fs.writeFileSync(filePath, data);
    } catch (e) {
      console.error(e.message);
      return false;
    }

    return true;
  }

  public appendDataToFile = (dir: string, fileName: string, data: string): boolean => {
    this.ensurePath(dir);

    try {
      fs.appendFileSync(path.join(dir, fileName), data);
    } catch (e) {
      console.error(e.message);
      return false;
    }

    return true;
  }
}
