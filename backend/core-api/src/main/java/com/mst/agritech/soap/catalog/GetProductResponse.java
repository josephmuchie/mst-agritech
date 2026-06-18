package com.mst.agritech.soap.catalog;

import jakarta.xml.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@XmlRootElement(name = "GetProductResponse", namespace = CatalogNamespace.NS)
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetProductResponse", namespace = CatalogNamespace.NS, propOrder = {"product"})
public class GetProductResponse {
    @XmlElement(namespace = CatalogNamespace.NS)
    private SoapProduct product;
}
